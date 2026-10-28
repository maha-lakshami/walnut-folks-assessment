import { Router } from "express";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
const router = Router();
const transactionSchema = z.object({
    type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
    amount: z.number().finite().positive(),
    description: z.string().trim().max(250).optional(),
    referenceId: z.string().trim().min(1).max(100),
});
// Create a deposit or withdrawal
router.post("/:accountId", async (req, res) => {
    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: parsed.error.issues,
        });
    }
    const { type, amount, description, referenceId } = parsed.data;
    const accountId = req.params.accountId;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const account = await tx.account.findUnique({
                where: { id: accountId },
            });
            if (!account) {
                throw new Error("ACCOUNT_NOT_FOUND");
            }
            const value = new Prisma.Decimal(amount);
            if (type === "WITHDRAWAL" && account.balance.lessThan(value)) {
                throw new Error("INSUFFICIENT_FUNDS");
            }
            const balance = type === "DEPOSIT"
                ? account.balance.add(value)
                : account.balance.sub(value);
            const updatedAccount = await tx.account.update({
                where: { id: accountId },
                data: { balance },
            });
            const transaction = await tx.transaction.create({
                data: {
                    accountId,
                    type,
                    amount: value,
                    description: description ?? null,
                    referenceId,
                },
            });
            return { account: updatedAccount, transaction };
        });
        return res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "ACCOUNT_NOT_FOUND") {
                return res.status(404).json({
                    error: "Account not found",
                });
            }
            if (error.message === "INSUFFICIENT_FUNDS") {
                return res.status(400).json({
                    error: "Insufficient funds",
                });
            }
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            return res.status(409).json({
                error: "This reference ID has already been used for this account",
            });
        }
        console.error("Failed to create transaction:", error);
        return res.status(500).json({
            error: "Failed to create transaction",
        });
    }
});
// Get transaction history with pagination
router.get("/:accountId", async (req, res) => {
    const accountId = req.params.accountId;
    const querySchema = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    });
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid pagination parameters",
            details: parsed.error.issues,
        });
    }
    const { page, limit } = parsed.data;
    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId },
            select: { id: true },
        });
        if (!account) {
            return res.status(404).json({
                error: "Account not found",
            });
        }
        const [transactions, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where: { accountId },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.transaction.count({
                where: { accountId },
            }),
        ]);
        return res.status(200).json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Failed to retrieve transactions:", error);
        return res.status(500).json({
            error: "Failed to retrieve transactions",
        });
    }
});
export default router;
//# sourceMappingURL=transactions.js.map