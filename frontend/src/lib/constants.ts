export const API_BASE_URL = "http://localhost:8080/api"

export const UNIVERSITIES = ["DU", "IPU"] as const

export const SEMESTERS = ["SEM1", "SEM2", "SEM3", "SEM4", "SEM5", "SEM6", "SEM7", "SEM8"] as const

export const COURSES: Record<string, string[]> = {
  DU: ["B.Tech", "B.Sc", "B.Com", "B.A", "BBA", "BCA", "M.Tech", "M.Sc", "MBA", "MCA", "LLB"],
  IPU: ["B.Tech", "B.Sc", "BBA", "BCA", "BJMC", "B.Arch", "B.Ed", "M.Tech", "MBA", "MCA"],
}
