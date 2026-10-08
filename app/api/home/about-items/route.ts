import { createCollectionRoutes } from "@/lib/home/collections";

const routes = createCollectionRoutes("about-items");

export const GET = routes.list;
export const POST = routes.create;
export const PUT = routes.reorder;
