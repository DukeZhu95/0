// types.ts

export interface Creator {
  username: string;
  id: string;
  profile_picture_url?: string;
}

export interface Submission extends BasePost {
  type: "submission";
}

export interface Challenge extends BasePost {
  type: "challenge";
  inspired_by_id: string;
  inspired_by: {
    title: string;
    username: string;
    profile_picture_url: string;
  };
}

export type Post = Submission | Challenge;
