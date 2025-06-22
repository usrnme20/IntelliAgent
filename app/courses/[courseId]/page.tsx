import { CourseLayout } from "@/components/course-layout"
import { notFound } from "next/navigation"

const courses = {
  "ap-biology": {
    name: "AP Biology",
    description: "Master cellular processes, genetics, evolution, and ecology",
    color: "bg-green-500",
    units: [
      "Chemistry of Life",
      "Cell Structure and Function",
      "Cellular Energetics",
      "Cell Communication and Cell Cycle",
      "Heredity",
      "Gene Expression and Regulation",
      "Natural Selection",
      "Ecology",
    ],
  },
  "ap-us-history": {
    name: "AP US History",
    description: "Explore American history from pre-Columbian to modern era",
    color: "bg-blue-500",
    units: [
      "Period 1: 1491-1607",
      "Period 2: 1607-1754",
      "Period 3: 1754-1800",
      "Period 4: 1800-1848",
      "Period 5: 1844-1877",
      "Period 6: 1865-1898",
      "Period 7: 1890-1945",
      "Period 8: 1945-1980",
      "Period 9: 1980-Present",
    ],
  },
  "ap-spanish": {
    name: "AP Spanish Language and Culture",
    description: "Develop fluency in Spanish language and culture",
    color: "bg-red-500",
    units: [
      "Families and Communities",
      "Science and Technology",
      "Beauty and Aesthetics",
      "Contemporary Life",
      "Global Challenges",
      "Personal and Public Identities",
    ],
  },
  "ap-french": {
    name: "AP French Language and Culture",
    description: "Master French language and francophone cultures",
    color: "bg-purple-500",
    units: [
      "Families and Communities",
      "Science and Technology",
      "Beauty and Aesthetics",
      "Contemporary Life",
      "Global Challenges",
      "Personal and Public Identities",
    ],
  },
  "ap-chemistry": {
    name: "AP Chemistry",
    description: "Understand chemical reactions, bonding, and thermodynamics",
    color: "bg-orange-500",
    units: [
      "Atomic Structure and Properties",
      "Molecular and Ionic Compound Structure",
      "Intermolecular Forces and Properties",
      "Chemical Reactions",
      "Kinetics",
      "Thermodynamics",
      "Equilibrium",
      "Acids and Bases",
      "Applications of Thermodynamics",
    ],
  },
  "ap-csa": {
    name: "AP Computer Science A",
    description: "Learn Java programming and computer science fundamentals",
    color: "bg-cyan-500",
    units: [
      "Primitive Types",
      "Using Objects",
      "Boolean Expressions and if Statements",
      "Iteration",
      "Writing Classes",
      "Array",
      "ArrayList",
      "2D Array",
      "Inheritance",
      "Recursion",
    ],
  },
}

interface CoursePageProps {
  params: {
    courseId: string
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const course = courses[params.courseId as keyof typeof courses]

  if (!course) {
    notFound()
  }

  return <CourseLayout courseId={params.courseId} course={course} />
}
