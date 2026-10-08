import { revalidatePath } from "next/cache";

/** Pages that render home page content (home, about, contact). */
const pagesUsingHomeContent = ["/", "/about", "/contact"];

export function revalidateHome() {
    for (const path of pagesUsingHomeContent) revalidatePath(path);
}

export function revalidateAbout() {
    revalidatePath("/about");
}
