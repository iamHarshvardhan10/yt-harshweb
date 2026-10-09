import { revalidatePath } from "next/cache";

/** Public pages that list sent issues. */
export function revalidateNewsletter() {
    revalidatePath("/newsletter");
    revalidatePath("/newsletter/issues/[id]", "page");
}
