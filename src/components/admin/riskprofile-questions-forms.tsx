'use client';

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RiskProfileQuestion } from "@/prisma/generated/client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createRiskProfileQuestion, deleteRiskProfileQuestion, updateRiskProfileQuestion } from "@/actions/admin/risk-profile";
import { useRouter } from "next/navigation";


export function RiskProfileQuestionsAdmin({
  questions: initialQuestions,
}: {
  questions: RiskProfileQuestion[];

}) {
  const [editing, setEditing] = useState<RiskProfileQuestion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isTransitioning, startTransition] = useTransition();
  const router = useRouter();

   const onCreate = async (data: QuestionFormValues) => {
      try {
         startTransition(() => {
            createRiskProfileQuestion(data)
               .then((result) => {
                  if(!result.success) throw new Error(result.message || "Failed to create question");
                  toast.success("Question created successfully");
                  setShowForm(false);
                  router.refresh(); 
               })
               .catch((error) => {
                  toast.error("Failed to create question: " + (error as Error).message);
                  setShowForm(false);
               });
         });
      } catch (error) {
         toast.error("Failed to create question: " + (error as Error).message);
      }
   }

   const onUpdate = async (id: string, data: QuestionFormValues) => {
        try {
         startTransition(() => {
            updateRiskProfileQuestion(id, data)
               .then((result) => {
                  if(!result.success) throw new Error(result.message || "Failed to update question");
                  toast.success("Question update successfully");
                  setShowForm(false);
                  router.refresh(); 
               })
               .catch((error) => {
                  toast.error("Failed to update question: " + (error as Error).message);
                  setShowForm(false);
               });
         });
      } catch (error) {
         toast.error("Failed to update question: " + (error as Error).message);
      }
   }


   const onDelete = async (id: string) => {
      try {
         startTransition(() => {
            deleteRiskProfileQuestion(id)
               .then((result) => {
                  if(!result.success) throw new Error(result.message || "Failed to delete question");
                  toast.success("Question delete successfully");
                  setShowForm(false);
                  router.refresh(); 
               })
               .catch((error) => {
                  toast.error("Failed to delete question: " + (error as Error).message);
                  setShowForm(false);
               });
         });
      } catch (error) {
         toast.error("Failed to delete question: " + (error as Error).message);
      }
   }


  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Questions</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>Add New</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialQuestions.map((q) => (
            <TableRow key={q.id}>
              <TableCell>{q.order}</TableCell>
              <TableCell>{q.question}</TableCell>
              <TableCell>{q.type}</TableCell>
              <TableCell>{q.category}</TableCell>
              <TableCell>
                <Badge variant={q.isActive ? 'outline' : 'secondary'}>
                  {q.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" onClick={() => { setEditing(q); setShowForm(true); }}>Edit</Button>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={() => onDelete(q.id)}>Delete</Button>
               </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showForm && (
        <div className="mt-6 border rounded-lg p-4 bg-muted">
            <RiskProfileQuestionForm
            initialData={
               editing
                  ? {
                     ...editing,
                     options:
                        editing.options !== null && editing.options !== undefined
                        ? JSON.stringify(editing.options, null, 2)
                        : "",
                  }
                  : undefined
            }
            onSubmit={async (data) => {
               if (editing) {
                  await onUpdate(editing.id, data);
               } else {
                  await onCreate(data);
               }
               setShowForm(false);
            }}
            onDelete={
               editing
                  ? async () => {
                     await onDelete(editing.id);
                     setShowForm(false);
                  }
                  : undefined
            }
            />
        </div>
      )}
    </div>
  );
}

const questionSchema = z.object({
  question: z.string().min(5),
  type: z.enum(["MCQ", "SCALE", "YES_NO", "TEXT"]),
  options: z.string().optional(), // JSON string for MCQ/YES_NO, SCALE, or empty
  isActive: z.boolean(),
  order: z.number().min(1),
  category: z.enum(["NORMAL", "PLATINA_WEALTH"]),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

export function RiskProfileQuestionForm({
  initialData,
  onSubmit,
  onDelete,
}: {
  initialData?: Partial<QuestionFormValues>;
  onSubmit: (data: QuestionFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {


  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: initialData?.question || "",
      type: initialData?.type || "MCQ",
      options: initialData?.options || "",
      isActive: initialData?.isActive ?? true,
      order: initialData?.order || 1,
      category: initialData?.category || "NORMAL",
    },
  });

   useEffect(() => {
    form.reset({
      question: initialData?.question || "",
      type: initialData?.type || "MCQ",
      options: initialData?.options || "",
      isActive: initialData?.isActive ?? true,
      order: initialData?.order || 1,
      category: initialData?.category || "NORMAL",
    });
  }, [initialData, form]);

  const watchType = form.watch("type");

  const [showOptions, setShowOptions] = useState(
    initialData?.type === "MCQ" || initialData?.type === "YES_NO" || initialData?.type === "SCALE"
  );
  useEffect(() => {
      setShowOptions(watchType === "MCQ" || watchType === "YES_NO" || watchType === "SCALE");
   }, [watchType]);

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter question text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setShowOptions(val === "MCQ" || val === "YES_NO" || val === "SCALE");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">MCQ</SelectItem>
                  <SelectItem value="SCALE">SCALE</SelectItem>
                  <SelectItem value="YES_NO">YES/NO</SelectItem>
                  <SelectItem value="TEXT">TEXT</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">NORMAL</SelectItem>
                  <SelectItem value="PLATINA_WEALTH">PLATINA_WEALTH</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showOptions && (
          <FormField
            control={form.control}
            name="options"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Options (JSON)
                  <span className="block text-xs text-muted-foreground">
                    For MCQ/YES_NO: [{"{"}"value": 1, "text": "Low risk", "weight": 1{"}"}]<br />
                    For SCALE: {"{"}"minScore": 1, "maxScore": 5{"}"}
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='[{"value":1,"text":"Low risk","weight":1}] or {"minScore":1,"maxScore":5}'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}