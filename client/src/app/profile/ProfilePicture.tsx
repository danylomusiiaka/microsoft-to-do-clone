"use client";
import { useProfileFunctions } from "@/components/functions/userFunctions";
import { useEffect, useState } from "react";

export default function ProfilePicture({ picture }: { picture: string }) {
  const [profilePicture, setProfilePicture] = useState(picture);
  const { updateField } = useProfileFunctions();

  useEffect(() => {
    setProfilePicture(picture);
  }, [picture]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Image = await convertToBase64(file);
        updateField("picture", base64Image);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = () => reject(new Error("File conversion failed"));
      fileReader.readAsDataURL(file);
    });

  return (
    <>
      <label
        htmlFor='img-upload'
        className='hover:outline hover:outline-2 hover:rounded-full'
      >
        <img
          src={profilePicture || "default-picture.svg"}
          alt='Profile'
          className='w-20 h-20 object-cover cursor-pointer rounded-full'
        />
      </label>
      <input
        type='file'
        id='img-upload'
        className='hidden'
        accept='image/*'
        onChange={handleFileUpload}
      />
    </>
  );
}
