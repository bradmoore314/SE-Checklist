import { FileUploadField } from "./FileUploadField";

interface SitePlanBomUploadFieldsProps {
  sitePlan: { file?: File | null; url?: string | null };
  onSitePlanChange: (value: { file?: File | null; url?: string | null }) => void;
  bom: { file?: File | null; url?: string | null };
  onBomChange: (value: { file?: File | null; url?: string | null }) => void;
  className?: string;
}

/**
 * Combined site plan and BOM upload fields component
 * For use in the Site Assessment tab
 */
export function SitePlanBomUploadFields({
  sitePlan,
  onSitePlanChange,
  bom,
  onBomChange,
  className = ""
}: SitePlanBomUploadFieldsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <FileUploadField
        label="Site Plan"
        value={sitePlan}
        onChange={onSitePlanChange}
        accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
        helperText="Upload a site plan document or provide a link to access it"
      />
      
      <FileUploadField
        label="Bill of Materials (BOM)"
        value={bom}
        onChange={onBomChange}
        accept=".pdf,.xlsx,.xls,.csv"
        helperText="Upload a BOM document or provide a link to the equipment list"
      />
    </div>
  );
}