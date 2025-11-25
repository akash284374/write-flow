import React, { useState } from "react";

const CreateFlow = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const handleCreate = () => {
    if (title.trim()) setShowEditor(true);
    else alert("Title is required");
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/flows/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content,
          tags: ["flow"],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Flow posted successfully!");
        setTitle("");
        setDescription("");
        setContent("");
        setShowEditor(false);
      } else {
        alert(data.message || "Failed to post flow");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="flex min-h-screen dark:bg-[#0f0f0f] text-white">
      <div className="flex-1 p-6">
        {!showEditor ? (
          <div className="bg-[#141414] border border-gray-700 rounded-xl p-6 max-w-md mx-auto mt-20 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Write Your Flow</h2>

            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full px-4 py-2 mb-4 rounded border border-gray-700 bg-[#0f0f0f] text-white focus:outline-none"
            />

            <button
              onClick={handleCreate}
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-white transition"
            >
              Create Flow
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mt-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500">Draft saved!</span>

              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  className="bg-black text-white px-4 py-2 rounded border border-white hover:bg-white hover:text-black"
                >
                  Publish
                </button>

                <button
                  onClick={() => {
                    setShowEditor(false);
                    setTitle("");
                    setDescription("");
                    setContent("");
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <h1 className="text-4xl font-bold">{title}</h1>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              className="w-full text-lg italic bg-transparent text-gray-400 focus:outline-none"
            />

            <hr className="border-gray-700" />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your flow..."
              rows={8}
              className="w-full bg-transparent text-white resize-none focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFlow;
