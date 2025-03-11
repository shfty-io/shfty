import { Badge } from "@/components/ui/badge"

interface ProductLicenseProps {
  license: string | null
}

export function ProductLicense({ license }: ProductLicenseProps) {
  if (!license) return null

  // Format the license name for display
  const formatLicense = (license: string) => {
    // Replace hyphens with spaces and capitalize each word
    return license
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-5">
      <h6 className="body-s md:body-xs font-semibold">Software License</h6>
      <div className="flex flex-wrap gap-2.5">
        <Badge
          variant="outline"
          className="cursor-default"
        >
          {formatLicense(license)}
        </Badge>
      </div>
    </div>
  )
} 