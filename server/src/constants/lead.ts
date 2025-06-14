export const POPULATES_LEAD = [
  {
    path: 'advisorID',
    select: 'name',
  },
  {
    path: 'campaignID',
    select: 'name',
  },
  {
    path:'bankID',
    select:'name'
  },
  {
    path: 'rejectedBanks',
    model: 'Bank',
    select: 'name',
  },
  {
    path: "projectDetails.projectID",
    model: "Project",
  },
  {
    path: "projectDetails.lotID",
    model: "Lots",
  } ,
  {
    path: "comments.userID",
    model: "User",
    select: ["name", "avatar"],
  }
]
