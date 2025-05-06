import React from "react";
import { cn } from "@/lib/utils";
import { Form as ShadcnForm } from "@/components/ui/form";

interface AutoDisabledFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

const AutoDisabledForm = React.forwardRef<HTMLFormElement, AutoDisabledFormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ShadcnForm {...props} className={cn("", className)} ref={ref} autoComplete="off">
        {children}
      </ShadcnForm>
    )
  }
);

AutoDisabledForm.displayName = "AutoDisabledForm";

export { AutoDisabledForm };