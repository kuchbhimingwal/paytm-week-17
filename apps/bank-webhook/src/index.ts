import express from "express";
import {PrismaClient} from "@repo/db/client";

const db = new PrismaClient();
const app = express();

app.post("/hdfcWebhook", async(req, res) => {
    //TODO: Add zod validation here?
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
    try {
      await db.$transaction([

          db.balance.update({
            where:{
              userId: paymentInformation.userId
            },
            data:{
              amount:{
                increment: paymentInformation.amount
              }
            }
          }),

          db.onRampTransaction.update({
            where:{
              token: paymentInformation.token
            },
            data:{
              status: "Success"
            }
          })
      ])

      res.status(200).json({
        message : "captured"
      })
    } catch (e) {
      console.error(e);
      res.status(411).json({
          message: "Error while processing webhook"
      })
      
    }

    // Update balance in db, add txn
})

app.listen(3003);