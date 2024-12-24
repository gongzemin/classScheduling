export interface ClassInfo {
  _id: string;
  startTime: number;
  endTime: number;
  courseTeacherName: string;
  courseTeacherPic: string;
  courseType: string;
  courseLevel: string;
}

export interface Reservation {
  _id: string;
  user_id: string;
  reserve_class_date: number;
  canceled: boolean;
  class_id: ClassInfo[];
  time?: string;
}
