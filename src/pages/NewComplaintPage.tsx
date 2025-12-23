import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { complaintsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { useToast } from '@/hooks/use-toast';
import type { ComplaintFormData, ComplaintCategory } from '@/types/types';
import { compressImage, validateImageFile, formatFileSize } from '@/lib/imageCompression';
import { cn } from '@/lib/utils';

const categoryOptions: { value: ComplaintCategory; label: string }[] = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'sanitation', label: 'Sanitation' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'public_safety', label: 'Public Safety' },
  { value: 'environment', label: 'Environment' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' }
];

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<ComplaintFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      location_address: '',
      citizen_name: '',
      citizen_email: '',
      citizen_phone: ''
    }
  });

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid File',
          description: validation.error,
          variant: 'destructive'
        });
        return;
      }
    }
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setSelectedFiles(prev => [...prev, ...files]);
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadImages(): Promise<string[]> {
    if (selectedFiles.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        
        // Compress image
        const { file: compressedFile, wasCompressed, compressedSize } = await compressImage(file);
        
        if (wasCompressed) {
          toast({
            title: 'Image Compressed',
            description: `Image compressed to ${formatFileSize(compressedSize)}`
          });
        }
        
        // Upload to Supabase
        const fileName = `${Date.now()}_${compressedFile.name}`;
        const { data, error } = await supabase.storage
          .from('complaint_images')
          .upload(fileName, compressedFile);
        
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('complaint_images')
          .getPublicUrl(data.path);
        
        uploadedUrls.push(publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  }

  async function onSubmit(values: ComplaintFormData) {
    try {
      setSubmitting(true);
      
      // Upload images if any
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages();
      }
      
      // Create complaint
      const complaintData: ComplaintFormData = {
        ...values,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined
      };
      
      const complaint = await complaintsApi.create(complaintData);
      
      toast({
        title: 'Success',
        description: 'Complaint submitted successfully'
      });
      
      navigate(`/complaints/${complaint.id}`);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit complaint',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Submit New Complaint</h1>
            <p className="text-muted-foreground mt-1">
              Report an issue to the appropriate department
            </p>
          </div>
        </div>

        <div className="max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>
                Provide detailed information about the issue you're reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: 'Title is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of the issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide detailed information about the issue..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This helps route your complaint to the right department
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location_address"
                    rules={{ required: 'Location is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address or landmark" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <FormLabel>Attachments</FormLabel>
                    <FormDescription>
                      Upload photos of the issue (max 10MB per file, will be compressed to under 1MB)
                    </FormDescription>
                    
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={uploadingImages || submitting}
                      />
                      <label
                        htmlFor="file-upload"
                        className={cn(
                          'cursor-pointer flex flex-col items-center gap-2',
                          (uploadingImages || submitting) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload images
                        </p>
                      </label>
                    </div>

                    {uploadingImages && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading images...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={uploadingImages || submitting}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Contact Information (Optional)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Provide your contact details if you'd like to receive updates
                    </p>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="citizen_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="citizen_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="citizen_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={submitting || uploadingImages}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || uploadingImages}
                    >
                      {submitting ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
