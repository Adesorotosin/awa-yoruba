"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  Save,
  X,
} from "lucide-react";

type Profile = {
  id: string;
  displayName: string | null;
  photoUrl: string | null;
  bio: string | null;
  qualifications: string | null;
  experienceYears: number | null;
  languages: string | null;
  specialties: string | null;
  hourlyRate: number | null;
  phone: string | null;
  email: string | null;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function TutorProfileEditor() {
  const [tutorId, setTutorId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    displayName: "",
    photoUrl: "",
    phone: "",
    experienceYears: "",
    languages: "",
    specialties: "",
    qualifications: "",
    bio: "",
    hourlyRate: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id =
      new URLSearchParams(window.location.search).get("tutorId") ?? "";

    setTutorId(id);

    if (!id) {
      setLoading(false);
      setError("Tutor profile ID is missing from the URL.");
      return;
    }

    void loadProfile(id);
  }, []);

  async function loadProfile(id: string) {
    try {
      const response = await fetch(
        `/api/tutor/profile?tutorId=${encodeURIComponent(id)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load profile.");
      }

      const next = result.profile as Profile;

      setProfile(next);

      setForm({
        displayName: next.displayName ?? "",
        photoUrl: next.photoUrl ?? "",
        phone: next.phone ?? "",
        experienceYears:
          next.experienceYears?.toString() ?? "",
        languages: next.languages ?? "",
        specialties: next.specialties ?? "",
        qualifications: next.qualifications ?? "",
        bio: next.bio ?? "",
        hourlyRate: next.hourlyRate?.toString() ?? "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    name: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handlePhotoSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setMessage("");

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setError(
        "Please choose a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError(
        "Profile photos must be 5 MB or smaller."
      );
      return;
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError(
        "Photo upload is not configured yet. Add the Cloudinary cloud name and upload preset to your .env.local file."
      );
      return;
    }

    setUploadingPhoto(true);

    try {
      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append(
        "upload_preset",
        uploadPreset
      );
      uploadData.append(
        "folder",
        "awa-yoruba/tutors"
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.secure_url) {
        throw new Error(
          result.error?.message ??
            "Unable to upload profile photo."
        );
      }

      updateField(
        "photoUrl",
        result.secure_url
      );

      setMessage(
        "Profile photo uploaded. Save your profile to keep the change."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload profile photo."
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  function removePhoto() {
    updateField("photoUrl", "");

    setMessage(
      "Photo removed from this profile draft. Save your profile to apply the change."
    );
  }

  async function saveProfile(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/tutor/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tutorId,
            ...form,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to save profile."
        );
      }

      setProfile(result.profile);

      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] p-8 text-center">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">
              AWA Yoruba
            </p>

            <h1 className="mt-1 text-xl font-black">
              Edit tutor profile
            </h1>
          </div>

          {tutorId && (
            <Link
              href={`/tutor/dashboard?tutorId=${tutorId}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#D7CCBD] px-4 py-2 text-sm font-bold text-[#114B33]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <form
          onSubmit={saveProfile}
          className="space-y-6"
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-[#C7DCCB] bg-[#EFF5EF] p-4 text-sm font-bold text-[#114B33]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}

          <section className="rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#EFF5EF] text-2xl font-black text-[#114B33] ring-4 ring-[#FFF8ED]">
                  {form.photoUrl ? (
                    <Image
                      src={form.photoUrl}
                      alt="Tutor profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    form.displayName
                      ?.slice(0, 2)
                      .toUpperCase() || "TU"
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploadingPhoto}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#114B33] text-white shadow-lg transition hover:bg-[#0B3A27] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingPhoto ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelected}
                  className="hidden"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-black">
                  Profile photo
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#777B75]">
                  Upload a clear photo of yourself.
                  JPG, PNG, or WebP, up to 5 MB.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploadingPhoto}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#114B33] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
                  >
                    <ImagePlus className="h-4 w-4" />

                    {uploadingPhoto
                      ? "Uploading..."
                      : "Choose photo"}
                  </button>

                  {form.photoUrl && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D8CDBD] px-4 py-2.5 text-sm font-black text-[#114B33] disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-black">
              About you
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="Display name"
                value={form.displayName}
                onChange={(v) =>
                  updateField("displayName", v)
                }
                required
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) =>
                  updateField("phone", v)
                }
              />

              <Field
                label="Years of experience"
                type="number"
                min="0"
                value={form.experienceYears}
                onChange={(v) =>
                  updateField(
                    "experienceYears",
                    v
                  )
                }
              />

              <Field
                label="Hourly rate (NGN)"
                type="number"
                min="0"
                value={form.hourlyRate}
                onChange={(v) =>
                  updateField(
                    "hourlyRate",
                    v
                  )
                }
              />
            </div>

            <div className="mt-5 grid gap-5">
              <TextArea
                label="Short bio"
                value={form.bio}
                onChange={(v) =>
                  updateField("bio", v)
                }
                placeholder="Tell learners what it is like to learn with you."
              />

              <TextArea
                label="Qualifications / teaching background"
                value={form.qualifications}
                onChange={(v) =>
                  updateField(
                    "qualifications",
                    v
                  )
                }
                placeholder="Degrees, certificates, teaching experience..."
              />

              <TextArea
                label="Languages you can teach in"
                value={form.languages}
                onChange={(v) =>
                  updateField(
                    "languages",
                    v
                  )
                }
                placeholder="Yoruba, English..."
              />

              <TextArea
                label="Specialties"
                value={form.specialties}
                onChange={(v) =>
                  updateField(
                    "specialties",
                    v
                  )
                }
                placeholder="Conversation, children, pronunciation..."
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={
                tutorId
                  ? `/tutors/${tutorId}`
                  : "/tutors"
              }
              className="inline-flex items-center justify-center rounded-xl border border-[#CFC3B2] px-5 py-3 text-sm font-black text-[#114B33]"
            >
              View profile
            </Link>

            <button
              type="submit"
              disabled={saving || uploadingPhoto}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#114B33] px-6 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-black">
      {label}

      <input
        required={required}
        type={type}
        min={min}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-[#D8CDBD] bg-[#FFFDF9] px-4 py-3 font-normal outline-none focus:border-[#114B33]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm font-black">
      {label}

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-xl border border-[#D8CDBD] bg-[#FFFDF9] px-4 py-3 font-normal outline-none focus:border-[#114B33]"
      />
    </label>
  );
}
