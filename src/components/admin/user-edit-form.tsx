"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserRole, UserType } from "@/prisma/generated/client";
import React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserFormInput, userFormSchema } from "@/lib/schema";
import { updateUser } from "@/actions/admin/user";
import { toast } from "sonner";


export function UserEditForm({ user }: {user : User | null}) {

  const router = useRouter();

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: user?.id ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      username: user?.username ?? "",
      image: user?.image ?? "",
      dob: user?.dob ?? "",
      pan: user?.pan ?? "",
      aadharNumber: user?.aadharNumber ?? "",
      gstin: user?.gstin ?? "",
      address: user?.address ?? "",
      state: user?.state ?? "",
      city: user?.city ?? "",
      zip: user?.zip ?? "",
      isBanned: user?.isBanned ?? false,
      userType: user?.userType ?? "INDIVIDUAL",
      role: user?.role ?? "USER",
      panVerified: user?.panVerified ? new Date(user.panVerified).toISOString().split("T")[0] : "",
      termsAccepted: user?.termsAccepted ? new Date(user.termsAccepted).toISOString().split("T")[0] : "",
      emailVerified: user?.emailVerified ? new Date(user.emailVerified).toISOString().split("T")[0] : "",
      phoneVerified: user?.phoneVerified ? new Date(user.phoneVerified).toISOString().split("T")[0] : "",
      password: "", // Password is optional for updates, but required for new users
   },
  });

  const onSubmit = async (data: UserFormInput) => {
    try {
  
      console.log("User update result:", data);
      const result = await updateUser(data)
      // if(!result.success) throw new Error(result.message);
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.log("Error saving user:", error);
      toast.error(`Failed to save user: ${(error as Error).message}`);
   }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="phone" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth (DD-MM-YYYY)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="DD-MM-YYYY"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pan</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aadharNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aadhar</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gstin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GST - IN</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip</FormLabel>
              <FormControl>
                <Input type="text" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="panVerified"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PAN Verified Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Terms & Conditon (Agreement) Acceptance Date
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailVerified"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Verification Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneVerified"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Verification Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Repeat for other fields... */}
        <FormField
          control={form.control}
          name="isBanned"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banned</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!user?.id && (
            <FormField
               control={form.control}
               name="password"
               render={({ field }) => (
               <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                     <Input 
                        type="password" 
                        {...field} 
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
               )}
            />
        )}
        <div className="col-span-2">
          <Button type="submit" className="w-full">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
