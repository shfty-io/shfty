import { Badge } from "@/components/ui/badge"

interface ProductLanguagesProps {
  technologies: string[] | null
}

export function ProductLanguages({ technologies }: ProductLanguagesProps) {
  if (!technologies || technologies.length === 0) return null

  return (
    <div className="space-y-5">
      <h6 className="body-s md:body-xs font-semibold">Technologies</h6>
      <div className="flex flex-wrap gap-2.5">
        {technologies.map((tech) => (
          <Badge
            key={tech}
            variant="outline"
            className="cursor-default"
          >
            {tech.replace('_', ' ')}
          </Badge>
        ))}
      </div>
    </div>
  )
} 