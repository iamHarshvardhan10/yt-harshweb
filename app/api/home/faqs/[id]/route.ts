import { createCollectionRoutes } from "@/lib/home/collections";

const routes = createCollectionRoutes("faqs");

export const GET = routes.read;
export const PATCH = routes.update;
export const DELETE = routes.remove;
