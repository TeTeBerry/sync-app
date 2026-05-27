export type AuthorGender = "female" | "male";

export function inferAuthorGenderFromPost(post: {
  authorName?: string;
  snippet?: string;
  tags?: string[];
  authorGender?: AuthorGender;
}): AuthorGender | undefined {
  if (post.authorGender === "female" || post.authorGender === "male") {
    return post.authorGender;
  }

  const haystack = [...(post.tags ?? []), post.snippet ?? ""].join(" ");

  if (
    /(\d+)人女生|女生同行|我们女生|女生一起/i.test(haystack) &&
    !/男生女生都可|男女都可/i.test(haystack)
  ) {
    return "female";
  }

  if (
    /(\d+)缺\d*男生|缺\d*男生|(\d+)人男生|男生拼车/i.test(haystack) &&
    !/男生女生都可|男女都可/i.test(haystack)
  ) {
    return "male";
  }

  if (/女生优先|限女生|只要女生|女孩子更好/i.test(haystack)) {
    return "female";
  }

  const name = post.authorName?.trim().toLowerCase() ?? "";
  const first = name.split(/\s+/)[0] ?? name;
  if (["luna", "zara", "mia", "jade", "nova", "chen"].some((h) => first.includes(h))) {
    return "female";
  }
  if (["ryan", "sam", "leo", "kai", "alex"].some((h) => first.includes(h))) {
    return "male";
  }

  return undefined;
}
