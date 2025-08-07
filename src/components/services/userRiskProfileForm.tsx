'use client'
import { RiskProfileQuestion } from '@/prisma/generated/client'
import React, { useEffect, useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { getRiskProfileQuestions, RiskProfileQuestionWithResponses } from '@/lib/data/riskprofile'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from '../ui/slider'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useSession } from 'next-auth/react'
import { User } from 'next-auth'
import { toast } from 'sonner'
import { createRiskProfile, saveRiskProfileAnswers } from '@/actions/risk-profile'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Updated Option type to use weight
type Option = { value: number | string; text: string; weight?: number };

type RiskProfileFormValues = {
  [questionId: string]: string | number
}

const getMaxPossibleWeight = (questions: RiskProfileQuestion[]) => {
  let total = 0;
  for (const q of questions) {
   if ((q.type === 'MCQ' || q.type === 'YES_NO') && Array.isArray(q.options)) {
   const maxOpt = q.options.reduce((max, opt: any) => {
      const optWeight = typeof opt === 'object' && opt !== null && typeof opt.weight === 'number' ? opt.weight : 0;
      return typeof max === 'number' && typeof optWeight === 'number'
         ? Math.max(max, optWeight)
         : max;
   }, 0);
   total += typeof maxOpt === 'number' ? maxOpt : 0;
   } else if (
      q.type === 'SCALE' &&
      q.options &&
      typeof q.options === 'object' &&
      !Array.isArray(q.options) &&
      typeof (q.options as any).maxScore === 'number'
    ) {
      const maxScore = (q.options as any).maxScore;
      total += typeof maxScore === 'number' ? maxScore : 0;
    }
    // TEXT questions add 0
  }
  return total;
};

const calculateWeights = (answers: RiskProfileFormValues, questions: RiskProfileQuestion[]) => {
  const result: Record<string, { answer: any; weight: number }> = {};

  for (const q of questions) {
    let userAnswer = answers[q.id];
    let weight = 0;
    
    if (typeof userAnswer === 'undefined' || userAnswer === null) {
      userAnswer = '';
    }
    if ((q.type === 'MCQ' || q.type === 'YES_NO') && Array.isArray(q.options)) {
      const found = (q.options as unknown[]).find(
        (opt: any) =>
          typeof opt === 'object' &&
          opt !== null &&
          'value' in opt &&
          String(opt.value) === String(userAnswer)
      );
      weight =
        found &&
        typeof found === 'object' &&
        found !== null &&
        'weight' in found &&
        typeof (found as any).weight === 'number'
          ? (found as any).weight
          : 0;  
    } else if (q.type === 'SCALE') {
      weight = typeof userAnswer === 'number' ? userAnswer : 0;
    } else if (q.type === 'TEXT') {
      weight = 0;
    }

    result[q.id] = { answer: userAnswer, weight };
  }

  return result;
};

const renderOptions = (
  question: RiskProfileQuestion,
  field: any // Accepts both register and Controller field
) => {
  if (question.type === 'MCQ' && Array.isArray(question.options)) {
    return (
      <RadioGroup
        value={field.value ?? ""}
        onValueChange={field.onChange}
        className="flex flex-col gap-2 mt-2"
      >
        {(question.options as Option[]).map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <RadioGroupItem value={String(opt.value)} id={`${question.id}-${idx}`} />
            <Label htmlFor={`${question.id}-${idx}`}>{opt.text}</Label>
          </div>
        ))}
      </RadioGroup>
    )
  }
  if (question.type === 'SCALE' && question.options && typeof question.options === 'object') {
    // options: { minScore: number, maxScore: number }
    const minScore = (question.options as { minScore?: number }).minScore ?? 0;
    const maxScore = (question.options as { maxScore?: number }).maxScore ?? 10;
    return (
      <div className="flex items-center gap-2 mt-2">
        <span>{minScore}</span>
        <Slider
          min={minScore}
          max={maxScore}
          step={1}
          value={[typeof field.value === 'number' ? field.value : minScore]}
          onValueChange={vals => field.onChange(vals[0])}
          className="w-[60%]"
        />
        <span>{maxScore}</span>
      </div>
    )
  }
  if (question.type === 'YES_NO' && Array.isArray(question.options)) {
    return (
      <RadioGroup
        value={field.value ?? ""}
        onValueChange={field.onChange}
        className="flex flex-row gap-6 mt-2"
      >
        {(question.options as Option[]).map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <RadioGroupItem value={String(opt.value)} id={`${question.id}-${opt.value}`} />
            <Label htmlFor={`${question.id}-${opt.value}`}>{opt.text}</Label>
          </div>
        ))}
      </RadioGroup>
    )
  }
  if (question.type === 'TEXT') {
    return (
      <Textarea
        {...field}
        className="mt-2"
        placeholder="Type your answer here..."
        rows={4}
      />
    )
  }
  return null
}

const UserRiskProfileQuestions = ({platina_wealth = false, className, text="Risk Profiling"}: {platina_wealth ?:boolean, className? :string, text?: string}) => {
  const [questions, setQuestions] = useState<RiskProfileQuestionWithResponses[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const router = useRouter();
  const {data, status} = useSession(); 
  const user : User = data?.user || null;

  useEffect(() => {
   if (!user?.id) return;
    (async () => {
      const result = await getRiskProfileQuestions(user?.id);
      if (result.success && result.data) {
        const questions = await result.data;
        setQuestions(questions);
      }
    })();
  }, [user?.id]);

  const form = useForm<RiskProfileFormValues>()

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)
  const filteredQuestions = platina_wealth
      ? sortedQuestions.filter(q => q.category === 'NORMAL' || q.category === 'PLATINA_WEALTH')
      : sortedQuestions.filter(q => q.category === 'NORMAL');

  const onSubmit = async (values: RiskProfileFormValues) => {
      const answersWithWeights = calculateWeights(values, sortedQuestions);
      const totalMaxWeight = getMaxPossibleWeight(sortedQuestions);
      const totalScore = Object.values(answersWithWeights).reduce((sum, item) => sum + item.weight, 0);

      const percentageScore = totalMaxWeight > 0 ? Number(((totalScore / totalMaxWeight) * 100).toFixed(2)) : 0;


      setLoading(true);
      try {
         console.log('Submitting risk profile answers:', answersWithWeights);
         const [profileResult, answersResult] = await Promise.all([
            createRiskProfile({
               userId: user.id,
               totalScore: totalScore,
               riskLevel: percentageScore < 30 ? 'CONSERVATIVE' : percentageScore < 60 ? 'MODERATE' : 'AGGRESSIVE',
               riskPercentage: percentageScore,
               platina_wealth: platina_wealth,
            }),
            saveRiskProfileAnswers(answersWithWeights, user.id)
         ]);
         if (!answersResult.success) throw new Error(answersResult.error || 'Failed to save answers');
         router.refresh();
         setOpen(false);
         toast.success('Risk profile answers saved successfully!');
      } catch (error) {
         toast.error(`Error: ${(error as Error).message || 'Failed to save answers'}`);
      } finally {
         setLoading(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className={cn("flex items-center gap-2 h-auto", className)}>
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Complete Your Risk Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {filteredQuestions.map((q, index) =>{
               let prevAnswer = q.userResponses && q.userResponses.length > 0
                  ? q.userResponses[0].answer
                  : '';

               if (
                 (q.type === 'MCQ' || q.type === 'YES_NO') &&
                 prevAnswer &&
                 typeof prevAnswer === 'object' &&
                 'value' in prevAnswer
               ) {
                 prevAnswer = (prevAnswer as any).value;
               }

               const safePrevAnswer =
                 typeof prevAnswer === 'string' || typeof prevAnswer === 'number'
                  ? prevAnswer
                  : '';

               const scaleDefault =
                  safePrevAnswer !== '' && safePrevAnswer !== null
                     ? safePrevAnswer
                     : (
                        q.options &&
                        typeof q.options === 'object' &&
                        !Array.isArray(q.options) &&
                        (q.options as { minScore?: number }).minScore !== undefined
                     )
                     ? (q.options as { minScore?: number }).minScore
                     : 0;
            

              return q.type === 'SCALE' ? (
                <Controller
                  key={q.id}
                  name={q.id}
                  control={form.control}
                  defaultValue={scaleDefault}
                  render={({ field }) => (
                    <FormItem className="p-4 border rounded-lg dark:bg-neutral-800 mb-2 shadow-sm">
                      <FormLabel className="font-medium">{index + 1}. {q.question}</FormLabel>
                      <FormControl>
                        {renderOptions(q, field)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  key={q.id}
                  name={q.id}
                  defaultValue={safePrevAnswer}
                  render={({ field }) => (
                    <FormItem className="p-4 border rounded-lg dark:bg-neutral-800 mb-2 shadow-sm">
                      <FormLabel className="font-medium">{index + 1}. {q.question}</FormLabel>
                      <FormControl>
                        {renderOptions(q, field)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            })}
            <Button type="submit" disabled={loading}>Submit</Button>
          </form>
        </Form>
        <DialogFooter>
          <p className='text-xs'> Please answer all questions to the best of your ability. Your responses will help us tailor our services to your financial goals and risk tolerance.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserRiskProfileQuestions