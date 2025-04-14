import { useState, useEffect, useRef } from "react";
import { Row, Column, Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";

interface EditableCellProps<TData, TValue> {
  value: string | number | boolean | null;
  row: Row<TData>;
  column: Column<TData, TValue>;
  onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}

export function EditableCell<TData, TValue>({
  value: initialValue,
  row,
  column,
  onUpdate,
}: EditableCellProps<TData, TValue>) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [originalValue, setOriginalValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
    setOriginalValue(initialValue);
  }, [initialValue]);

  // Get enum options if they exist
  const options = column.columnDef.meta?.options as { value: string, label: string }[] | undefined;
  
  // Get custom formatter if it exists
  const formatter = column.columnDef.meta?.formatter as ((value: any) => string) | undefined;
  
  // Get custom input type if it exists (default: text)
  const inputType = column.columnDef.meta?.inputType as string | undefined || "text";

  const startEdit = () => {
    // Don't allow editing if the cell is marked as readonly
    if (column.columnDef.meta?.readOnly) {
      return;
    }
    
    setIsEditing(true);
    // Focus the input after it renders
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  };

  const onBlur = () => {
    submit();
  };

  const submit = () => {
    setIsEditing(false);
    if (value !== originalValue) {
      if (onUpdate) {
        onUpdate(row.index, column.id, value);
      }
      setOriginalValue(value);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setValue(originalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  // Render a select dropdown for enum values
  if (options && isEditing) {
    return (
      <div className="relative">
        <Select 
          value={value as string}
          onValueChange={(newValue) => setValue(newValue)}
          onOpenChange={(open) => {
            if (!open) submit();
          }}
        >
          <SelectTrigger className="h-9 w-full" onKeyDown={handleKeyDown}>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="absolute right-0 top-0 flex h-9">
          <Button variant="ghost" size="icon" onClick={cancel} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={submit} className="h-9 w-9">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type={inputType}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          className="h-9 w-full pr-20"
          autoComplete="off"
        />
        <div className="absolute right-0 top-0 flex h-9">
          <Button variant="ghost" size="icon" onClick={cancel} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={submit} className="h-9 w-9">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "truncate px-2 py-1 rounded-md w-full transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground",
          {
            "opacity-50 italic": value === null || value === "",
          }
        )}
        onClick={startEdit}
      >
        {formatter ? formatter(value) : value === null || value === "" ? "—" : String(value)}
      </div>
      {!column.columnDef.meta?.hideEditIcon && (
        <Button variant="ghost" size="icon" onClick={startEdit} className="h-7 w-7 opacity-0 group-hover:opacity-100">
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}