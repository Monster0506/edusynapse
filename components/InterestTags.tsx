import type React from "react"
import { Button } from "@/components/ui/button"

interface InterestTagsProps {
  selectedInterests: string[]
  onInterestsChange: (interests: string[]) => void
}

const InterestTags: React.FC<InterestTagsProps> = ({ selectedInterests, onInterestsChange }) => {
  const interests = [
    "Mathematics",
    "Science",
    "Literature",
    "History",
    "Art",
    "Music",
    "Technology",
    "Programming",
    "Languages",
    "Physical Education",
    "Biology",
    "Chemistry",
    "Physics",
    "Economics",
    "Psychology",
    "Sociology",
    "Philosophy",
    "Political Science",
    "Environmental Studies",
    "Business",
    "Engineering",
    "Medicine",
    "Law",
    "Architecture",
  ]

  const handleInterestClick = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest]
    onInterestsChange(newInterests)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Select Your Interests</h3>
      <p className="text-sm text-muted-foreground">Choose topics that interest you</p>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <Button
            key={interest}
            type="button"
            variant={selectedInterests.includes(interest) ? "default" : "outline"}
            size="sm"
            onClick={() => handleInterestClick(interest)}
          >
            {interest}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default InterestTags

