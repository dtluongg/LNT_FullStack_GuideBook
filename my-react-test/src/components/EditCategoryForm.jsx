// components/EditCategoryForm.jsx
import React, { useState } from "react";

const EditCategoryForm = ({
  initialTitle,
  initialOrder,
  initialActive,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [order, setOrder] = useState(initialOrder || 0);
  const [active, setActive] = useState(initialActive);

  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-2 py-1 text-sm rounded"
        placeholder="Title"
      />
      <input
        type="number"
        value={order}
        onChange={(e) => setOrder(Number(e.target.value))}
        className="border px-2 py-1 text-sm rounded"
        placeholder="Order index"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ title, order_index: order, is_active: active })}
          className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditCategoryForm;
