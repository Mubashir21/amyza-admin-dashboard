"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { 
  updateTeacher,
  updateTeacherProfilePicture,
  removeTeacherProfilePicture,
  Teacher,
} from "@/lib/teachers-services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().min(1, { message: "Department is required." }),
  position: z.string().min(1, { message: "Position is required." }),
  hire_date: z.date({ message: "Please select a hire date." }),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"], {
    message: "Please select a status.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
  onTeacherUpdated?: () => void;
}

export function EditTeacherDialog({
  open,
  onOpenChange,
  teacher,
  onTeacherUpdated,
}: EditTeacherDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      hire_date: new Date(),
      notes: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (teacher && open) {
      form.reset({
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email || "",
        phone: teacher.phone || "",
        department: teacher.department,
        position: teacher.position,
        hire_date: teacher.hire_date ? new Date(teacher.hire_date) : new Date(),
        notes: teacher.notes || "",
        status: teacher.is_active ? "active" : "inactive",
      });
      
      // Set preview URL if teacher has profile picture
      if (teacher.profile_picture) {
        setPreviewUrl(teacher.profile_picture);
      } else {
        setPreviewUrl(null);
      }
      setProfileImage(null);
      setShouldDeleteImage(false);
    }

    // Reset everything when dialog closes
    if (!open) {
      setProfileImage(null);
      setPreviewUrl(null);
      setShouldDeleteImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [teacher, open, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setProfileImage(file);
    setShouldDeleteImage(false); // Reset delete flag when new image is selected
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Image selected successfully!");
  };

  const removeImage = () => {
    setProfileImage(null);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // If there was an original image, mark it for deletion
    if (teacher?.profile_picture) {
      setShouldDeleteImage(true);
    }

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      // Handle profile picture changes first
      if (shouldDeleteImage) {
        await removeTeacherProfilePicture(teacher.id);
      } else if (profileImage) {
        await updateTeacherProfilePicture(teacher.id, profileImage);
      }

      // Prepare update data (transform to match CreateTeacherData interface)
      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        department: values.department,
        position: values.position,
        hire_date: values.hire_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        notes: values.notes || undefined,
        status: values.status, // Keep as 'active'/'inactive' for the service
      };

      console.log("Updating teacher with data:", updateData);
      await updateTeacher(teacher.id, updateData);
      toast.success("Teacher updated successfully!");
      
      onOpenChange(false);
      
      if (onTeacherUpdated) {
        onTeacherUpdated();
      }
      router.refresh();
    } catch (error) {
      console.error("Error updating teacher:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Handle specific Supabase error codes
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message?: string };
        switch (supabaseError.code) {
          case '23505':
            toast.error("A teacher with this email already exists.");
            break;
          case '42P01':
            toast.error("Database table not found. Please contact support.");
            break;
          case '23503':
            toast.error("Invalid reference data. Please check your input.");
            break;
          default:
            toast.error(`Database error: ${supabaseError.message || 'Unknown error'}`);
        }
      } else {
        toast.error("Failed to update teacher. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Update the information for {teacher.first_name} {teacher.last_name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Information</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={previewUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg">
                      {form.watch("first_name") && form.watch("last_name")
                        ? `${form.watch("first_name")[0]}${form.watch("last_name")[0]}`.toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Photo
                    </Button>

                    {(previewUrl || profileImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {profileImage ? "Remove Selected" : "Remove Photo"}
                      </Button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
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
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mathematics, English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Teacher, Head of Department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hire Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the teacher..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
