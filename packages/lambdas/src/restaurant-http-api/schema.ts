import type {
	PostRestaurantOrder,
	RestaurantMenuItem,
	RestaurantTable,
} from "@app/shared"
import Joi from "joi"

const MenuItemSchema = Joi.object<RestaurantMenuItem>({
	id: Joi.number().required(),
	name: Joi.string().required(),
	price: Joi.number().required(),
})
export const PostOrderBodySchema = Joi.object<PostRestaurantOrder>({
	tableId: Joi.number().required(),
	menuItems: Joi.array().min(1).items(MenuItemSchema).required(),
})

export const PatchTableBodySchema = Joi.object<RestaurantTable>({
	id: Joi.number().required(),
	state: Joi.string().valid("READY_FOR_ORDER").required(),
})
