'use client'

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React, { useRef, useState } from 'react'
import { Button } from '../ui/button';
import Image from 'next/image';
import { ZoomIn } from '../animation/zoom';
import { toast } from 'sonner';
import { updateUserProfilePicture } from '@/actions/profile';
import { useSession } from 'next-auth/react';
import { getSession } from '@/lib/slices/authSlice';
import { setModalOpen } from '@/lib/slices/profile';

const AvatarChange = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {update, data} = useSession();
  const user = data?.user;
  const dispatch = useAppDispatch();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setSelectedAvatar(null);
      setUploadFile(file);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setPreview(null);
    setUploadFile(null);
  };

  const currentProfile =
    preview ||
    selectedAvatar ||
    (user?.image?.startsWith('http') || user?.image?.startsWith('/')
      ? user.image
      : `/profile/user-1.png`) ||
    `/profile/user-1.png`;

  // Simulated update handler (replace with your actual API call)
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      if (uploadFile) {
        // Upload the file to your backend here
        // Example: await uploadProfileImage(uploadFile)
      } else if (selectedAvatar) {
         await updateUserProfilePicture(user?.id!, selectedAvatar);
         await update({
            ...data,
            user: {
               ...data?.user,
               image: selectedAvatar,
            }
         });
      }
      toast.success('Profile picture updated successfully');
      dispatch(setModalOpen({open : false}));
    } catch (err) {
      toast.error(`${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full dark:bg-neutral-800 bg-white shadow rounded-md flex flex-col gap-4 p-4 mx-auto">
      <div className="flex flex-col gap-4 items-center w-full">
        {/* Current profile display */}
        <div className="flex flex-col items-center mb-2">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
            <Image
              src={currentProfile}
              alt="Current Profile"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-full border-2 border-green-500 shadow"
              sizes="(min-width: 768px) 96px, (min-width: 640px) 80px, 64px"
            />
          </div>
          <span className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">Current profile</span>
        </div>
        <h6 className="text-base md:text-lg font-semibold">Select your profile</h6>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 w-full justify-items-center">
          {/* Default avatars */}
          {[...Array(8)].map((_, i) => {
            const avatarPath = `/profile/user-${i + 1}.png`;
            return (
              <Button
                variant={selectedAvatar === avatarPath ? 'secondary' : 'ghost'}
                key={i + 1}
                className={`h-20 w-20 md:h-24 md:w-24 ${selectedAvatar === avatarPath ? 'ring-2 ring-legacisPurple' : ''}`}
                onClick={() => handleAvatarSelect(avatarPath)}
                type="button"
              >
                <ZoomIn
                  delay={i * 0.05}
                  className="border-2 rounded-full h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 p-1 relative border-legacisPurple/50 shadow"
                >
                  <Image
                    src={avatarPath}
                    alt={`Avatar ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-all duration-200 rounded-full"
                  />
                </ZoomIn>
              </Button>
            );
          })}
          {/* Custom upload */}
          <Button
            variant="outline"
            className={`h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex flex-col items-center justify-center border-2 border-dashed border-legacisPurple/50 relative ${preview ? 'ring-2 ring-legacisPurple' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <div className="flex flex-col items-center justify-center h-full w-full">
              {preview ? (
                <Image
                  src={preview}
                  alt="Custom Avatar"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-full"
                />
              ) : (
                <>
                  <span className="text-3xl md:text-4xl">+</span>
                  <span className="text-xs mt-1">Upload</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </Button>
        </div>
        <Button
          className="mt-4 w-full max-w-xs"
          onClick={handleUpdateProfile}
          disabled={loading || (!preview && !selectedAvatar)}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </div>
  )
}

export default AvatarChange