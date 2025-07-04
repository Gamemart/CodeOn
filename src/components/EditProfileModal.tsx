import React, { useState, useEffect } from 'react';
import { X, Upload, Palette, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import AvatarCropper from '@/components/AvatarCropper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Import the Profile interface from useProfile to ensure consistency
interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  banner_type: string | null;
  banner_value: string | null;
  status_message: string | null;
  profile_alignment?: string | null;
  font_family?: string | null;
  created_at: string;
  updated_at: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }: EditProfileModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    status_message: '',
    banner_type: 'color',
    banner_value: '#3B82F6',
    profile_alignment: 'left',
    font_family: 'Inter'
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        status_message: profile.status_message || '',
        banner_type: profile.banner_type || 'color',
        banner_value: profile.banner_value || '#3B82F6',
        profile_alignment: profile.profile_alignment || 'left',
        font_family: profile.font_family || 'Inter'
      });
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatarFile(file);
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setAvatarFile(croppedFile);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(croppedFile);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('profile-media')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      let avatarUrl = profile.avatar_url;
      let bannerValue = formData.banner_value;

      // Upload avatar if changed
      if (avatarFile) {
        const uploadedAvatarUrl = await uploadFile(avatarFile, 'avatars');
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        }
      }

      // Upload banner if it's an image and file is selected
      if (formData.banner_type === 'image' && bannerFile) {
        const uploadedBannerUrl = await uploadFile(bannerFile, 'banners');
        if (uploadedBannerUrl) {
          bannerValue = uploadedBannerUrl;
        }
      }

      // Prepare the update object with only the fields that exist in the database
      const updates: any = {
        username: formData.username || null,
        full_name: formData.full_name || null,
        avatar_url: avatarUrl,
        banner_type: formData.banner_type,
        banner_value: bannerValue,
        status_message: formData.status_message || null,
        profile_alignment: formData.profile_alignment,
        updated_at: new Date().toISOString()
      };

      // Only add font_family if it's supported (check if column exists)
      try {
        // Test if font_family column exists by doing a simple select
        const { error: testError } = await supabase
          .from('profiles')
          .select('font_family')
          .eq('id', user.id)
          .limit(1);
        
        if (!testError) {
          updates.font_family = formData.font_family;
        }
      } catch (e) {
        console.log('font_family column not available yet');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      const updatedProfile = { ...profile, ...updates };
      onProfileUpdate(updatedProfile);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)'
  ];

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#6366F1', '#F97316', '#14B8A6', '#A855F7'
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Left', icon: AlignLeft },
    { value: 'center', label: 'Center', icon: AlignCenter },
    { value: 'right', label: 'Right', icon: AlignRight }
  ];

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'Garamond', label: 'Garamond' },
    { value: 'Alice', label: 'Alice' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="status_message">Bio</Label>
              <Textarea
                id="status_message"
                value={formData.status_message}
                onChange={(e) => setFormData(prev => ({ ...prev, status_message: e.target.value }))}
                placeholder="Tell us about yourself..."
                maxLength={150}
                className="resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.status_message.length}/150 characters
              </p>
            </div>

            {/* Font Family Selection */}
            <div>
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Family
              </Label>
              <Select
                value={formData.font_family}
                onValueChange={(value) => setFormData(prev => ({ ...prev, font_family: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {fontOptions.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Preview: <span style={{ fontFamily: formData.font_family }}>The quick brown fox jumps over the lazy dog</span>
              </p>
            </div>

            {/* Profile Alignment */}
            <div>
              <Label>Profile Info Alignment</Label>
              <RadioGroup
                value={formData.profile_alignment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, profile_alignment: value }))}
                className="mt-2"
              >
                <div className="grid grid-cols-3 gap-4">
                  {alignmentOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                          <IconComponent className="h-4 w-4" />
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Avatar Section */}
          <div>
            <Label>Avatar</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-xs">No image</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Avatar
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          {/* Banner Section */}
          <div>
            <Label>Profile Banner</Label>
            <Tabs value={formData.banner_type} onValueChange={(value) => setFormData(prev => ({ ...prev, banner_type: value }))}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="gradient">Gradient</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>

              <TabsContent value="color" className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-lg border-2 ${
                        formData.banner_value === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, banner_value: color }))}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gradient" className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {gradients.map((gradient, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full h-16 rounded-lg border-2 ${
                        formData.banner_value === gradient ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ background: gradient }}
                      onClick={() => setFormData(prev => ({ ...prev, banner_value: gradient }))}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {bannerPreview ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No banner image</span>
                    </div>
                  )}
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                      id="banner-upload"
                    />
                    <Label htmlFor="banner-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Upload Banner
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Avatar Cropper */}
      <AvatarCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        imageFile={selectedAvatarFile}
        onCropComplete={handleCropComplete}
      />
    </Dialog>
  );
};

export default EditProfileModal;