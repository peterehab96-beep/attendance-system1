// Shared subjects data for the music education system
// This ensures consistency between student registration and admin QR code generation

export const academicLevels = ["First Year", "Second Year", "Third Year", "Fourth Year"] as const

export const subjectsByLevel = {
  "First Year": [
    "Western Rules & Solfege 1",
    "Western Rules & Solfege 2", 
    "Rhythmic Movement 1"
  ],
  "Second Year": [
    "Western Rules & Solfege 3",
    "Western Rules & Solfege 4",
    "Hymn Singing",
    "Rhythmic Movement 2"
  ],
  "Third Year": [
    "Western Rules & Solfege 5",
    "Improvisation 1"
  ],
  "Fourth Year": [
    "Western Rules & Solfege 6", 
    "Improvisation 2"
  ]
} as const

// Arabic subject names (for future localization)
export const subjectsByLevelArabic = {
  "First Year": [
    "قواعد غربية وصولفيج ١",
    "قواعد غربية وصولفيج ٢",
    "حركة إيقاعية ١"
  ],
  "Second Year": [
    "قواعد غربية وصولفيج ٣", 
    "قواعد غربية وصولفيج ٤",
    "إنشاد ديني",
    "حركة إيقاعية ٢"
  ],
  "Third Year": [
    "قواعد غربية وصولفيج ٥",
    "ارتجال ١"
  ],
  "Fourth Year": [
    "قواعد غربية وصولفيج ٦",
    "ارتجال ٢" 
  ]
} as const

export type AcademicLevel = typeof academicLevels[number]
export type SubjectsByLevel = typeof subjectsByLevel