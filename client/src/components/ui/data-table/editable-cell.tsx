import { useState, useRef, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditableCellProps<TData, TValue> {
  value: string | null;
  row: any;
  column: any;
  onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}

export function EditableCell<TData, TValue>({
  value: initialValue,
  row,
  column,
  onUpdate,
}: EditableCellProps<TData, TValue>) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string | null>(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  // When the initial value changes (like after an update), update the internal state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  // Get the column meta for special rendering options
  const columnMeta = column.columnDef.meta || {};
  
  // Check if we have options for a select
  const selectOptions = columnMeta.options || [];
  
  // Check if we have a formatter for display
  const formatter = columnMeta.formatter;
  
  // Get the input type from meta (default to text)
  const inputType = columnMeta.inputType || 'text';
  
  // Check if the cell is read-only
  const isReadOnly = columnMeta.readOnly === true;
  
  // Format the display value if a formatter is provided
  const displayValue = formatter ? formatter(value) : value;
  
  // Toggle edit mode
  const enableEdit = () => {
    if (isReadOnly) return;
    setIsEditing(true);
  };
  
  // Handle saving changes
  const saveChanges = () => {
    setIsEditing(false);
    
    // Only update if the value actually changed
    if (value !== initialValue && onUpdate) {
      onUpdate(row.index, column.id, value);
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  
  // Handle select changes
  const handleSelectChange = (newValue: string) => {
    setValue(newValue);
  };
  
  // Handle keyboard events (Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      saveChanges();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(initialValue); // Reset to initial value
    }
  };
  
  // Handle blur event (save on blur)
  const handleBlur = () => {
    saveChanges();
  };
  
  // If we're editing, render the input or select
  if (isEditing) {
    if (selectOptions.length > 0) {
      return (
        <Select 
          value={value || ""}
          onValueChange={handleSelectChange}
          onOpenChange={(open) => {
            if (!open) saveChanges();
          }}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option: any) => (
              <SelectItem 
                key={option.value || option} 
                value={option.value || option}
              >
                {option.label || option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          ref={inputRef}
          className="h-8 w-full p-1"
          value={value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          type={inputType}
          autoComplete="off"
        />
      );
    }
  }
  
  // If we're not editing, render the display value with an edit button
  return (
    <div className="flex items-center space-x-2 relative group">
      <div className="flex-1 truncate">
        {displayValue !== null && displayValue !== undefined
          ? displayValue
          : ""}
      </div>
      {!isReadOnly && !columnMeta.hideEditIcon && (
        <Button
          variant="ghost"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          onClick={enableEdit}
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}