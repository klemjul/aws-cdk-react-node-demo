import type { RestaurantMenuItem, RestaurantTable } from "@app/shared"

const menuItemDatas: RestaurantMenuItem[] = [
	{ id: 1, name: "Garden Salad", price: 7.99 },
	{ id: 2, name: "Garlic Breadsticks (6 pieces)", price: 5.49 },
	{ id: 3, name: "Soup of the Day", price: 6.99 },
	{ id: 4, name: "Grilled Salmon with Lemon Butter Sauce", price: 18.99 },
	{ id: 5, name: "Classic Cheeseburger with Fries", price: 12.99 },
	{ id: 6, name: "Spaghetti Carbonara", price: 14.99 },
	{ id: 7, name: "Vegetable Stir-Fry", price: 11.99 },
	{ id: 8, name: "New York Cheesecake", price: 8.99 },
	{ id: 9, name: "Chocolate Lava Cake", price: 9.49 },
	{ id: 10, name: "Fruit Salad", price: 6.99 },
	{ id: 11, name: "Soft Drinks (Coke, Sprite, Fanta)", price: 2.49 },
	{ id: 12, name: "Freshly Brewed Coffee", price: 3.99 },
	{ id: 13, name: "Iced Tea (Sweetened/Unsweetened)", price: 2.99 },
]

const tableDatas: RestaurantTable[] = [
	{
		id: 1,
		state: "READY_FOR_ORDER",
	},
	{
		id: 2,
		state: "READY_FOR_ORDER",
	},
	{
		id: 3,
		state: "READY_FOR_ORDER",
	},
	{
		id: 4,
		state: "READY_FOR_ORDER",
	},
]

export { menuItemDatas, tableDatas }
