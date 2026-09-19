import sharp from "sharp";
import { inspectCraftImage } from "../server/services/craftInspection.service.js";

async function run() {
  console.log("=== RUNNING IMAGE DETECTION VERIFICATION ON 3 DISTINCT CRAFT PRODUCTS ===");

  // 1. Terracotta Pottery Cup (Clay / Pottery / Earthy Red-Rust)
  const terracottaBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 180, g: 90, b: 60 } // Terracotta rust clay
    }
  }).jpeg().toBuffer();
  const terracottaBase64 = `data:image/jpeg;base64,${terracottaBuffer.toString("base64")}`;

  console.log("\n--- Testing Product 1: Terracotta Pottery ---");
  const res1 = await inspectCraftImage(terracottaBase64, "en");
  console.log("Product 1 Result:", JSON.stringify({
    success: res1.success,
    product_name: res1.data?.product_name,
    category: res1.data?.category,
    material: res1.data?.material,
    colour: res1.data?.colour,
    craft_technique: res1.data?.craft_technique,
    confidence: res1.data?.confidence,
    needs_user_input: res1.data?.needs_user_input
  }, null, 2));

  // 2. Channapatna Wooden Toy / Stacker (Woodcraft / Bright Lacquer Yellow & Red)
  const toyBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 210, g: 155, b: 50 } // Bright saffron lacquer wood
    }
  }).jpeg().toBuffer();
  const toyBase64 = `data:image/jpeg;base64,${toyBuffer.toString("base64")}`;

  console.log("\n--- Testing Product 2: Channapatna Wooden Toy ---");
  const res2 = await inspectCraftImage(toyBase64, "en");
  console.log("Product 2 Result:", JSON.stringify({
    success: res2.success,
    product_name: res2.data?.product_name,
    category: res2.data?.category,
    material: res2.data?.material,
    colour: res2.data?.colour,
    craft_technique: res2.data?.craft_technique,
    confidence: res2.data?.confidence,
    needs_user_input: res2.data?.needs_user_input
  }, null, 2));

  // 3. Handloom Silk Saree (Handloom / Pure Silk / Crimson)
  const sareeBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 150, g: 45, b: 60 } // Deep crimson silk
    }
  }).jpeg().toBuffer();
  const sareeBase64 = `data:image/jpeg;base64,${sareeBuffer.toString("base64")}`;

  console.log("\n--- Testing Product 3: Handloom Silk Saree ---");
  const res3 = await inspectCraftImage(sareeBase64, "en");
  console.log("Product 3 Result:", JSON.stringify({
    success: res3.success,
    product_name: res3.data?.product_name,
    category: res3.data?.category,
    material: res3.data?.material,
    colour: res3.data?.colour,
    craft_technique: res3.data?.craft_technique,
    confidence: res3.data?.confidence,
    needs_user_input: res3.data?.needs_user_input
  }, null, 2));

  // 4. Test Unreadable / Dark Image for error fallback
  const darkBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 10, g: 10, b: 10 } // Dark ambiguous photo
    }
  }).jpeg().toBuffer();
  const darkBase64 = `data:image/jpeg;base64,${darkBuffer.toString("base64")}`;

  console.log("\n--- Testing Product 4: Unreadable Dark Photo ---");
  const res4 = await inspectCraftImage(darkBase64, "en");
  console.log("Product 4 Result:", JSON.stringify({
    success: res4.success,
    error: res4.error,
    message: res4.message
  }, null, 2));

  console.log("\n=== VERIFICATION COMPLETE ===");
}

run().catch(console.error);
