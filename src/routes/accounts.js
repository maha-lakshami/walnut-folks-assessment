import { Router } from "express";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
const router = Router();
const createAccountSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    initialBalance: z.number().finite().min(0).default(0),
});
// Create a new account
router.post("/", async (req, res) => {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: parsed.error.issues,
        });
    }
    try {
        const account = await prisma.account.create({
            data: {
                name: parsed.data.name,
                balance: new Prisma.Decimal(parsed.data.initialBalance),
            },
        });
        return res.status(201).json({ account });
    }
    catch (error) {
        console.error("Failed to create account:", error);
        return res.status(500).json({
            error: "Failed to create account",
        });
    }
});
// Get an account by ID
router.get("/:id", async (req, res) => {
    try {
        const account = await prisma.account.findUnique({
            where: { id: req.params.id },
        });
        if (!account) {
            return res.status(404).json({
                error: "Account not found",
            });
        }
        return res.status(200).json({ account });
    }
    catch (error) {
        console.error("Failed to retrieve account:", error);
        return res.status(500).json({
            error: "Failed to retrieve account",
        });
    }
});
export default router;
//# sourceMappingURL=accounts.js.map