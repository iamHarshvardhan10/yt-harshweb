import { createCollectionRoutes } from "@/lib/home/collections";

const routes = createCollectionRoutes("metrics");

export const GET = routes.read;
export const PATCH = routes.update;
export const DELETE = routes.remove;
