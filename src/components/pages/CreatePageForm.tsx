"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const CreatePageForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isPublished: false,
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async () => {
    console.log(formData);

    const res = await fetch("http://localhost:3000/api/admin/pages", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    router.refresh();

    if (!res.ok) {
      console.log("Error creating page");
    } else {
      console.log("Page created successfully");
    }
  };

  return (
    <>
      <p>add new Page</p>

      <div className="flex flex-col gap-4">
        <input
          value={formData.name}
          onChange={onChange}
          type="text"
          name="name"
          placeholder="name"
        />
        <input
          value={formData.slug}
          onChange={onChange}
          type="text"
          name="slug"
          placeholder="slug"
        />
        <input
          value={formData.description}
          onChange={onChange}
          type="text"
          name="description"
          placeholder="description"
        />
        <input
          checked={formData.isPublished}
          onChange={onChange}
          type="checkbox"
          name="isPublished"
        />
        <Button onClick={handleSubmit}>Create</Button>
      </div>
    </>
  );
};

export default CreatePageForm;
