import { ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Progress } from "@/components/ui/progress"

interface ModuleNavigationHeaderProps {
  pathName: string
  moduleName: string
  moduleNumber: number
  completedModules: number
  totalModules: number
}

export default function ModuleNavigationHeader({
  pathName,
  moduleName,
  moduleNumber,
  completedModules,
  totalModules,
}: ModuleNavigationHeaderProps) {
  const progressPercentage = (completedModules / totalModules) * 100

  return (
    <Card className="border-none rounded-none shadow-md">
      <CardHeader className="pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/learning-path">Learning Path</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/learning-paths/${pathName}`}>{pathName}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                Module {moduleNumber}: {moduleName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-medium">
          Progress: {completedModules}/{totalModules} Modules Completed
        </div>
        <Progress value={progressPercentage} className="mt-2" />
      </CardContent>
    </Card>
  )
}

