import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [customerEmail],
          subject: \`Order Confirmation - #\${String(orderId).slice(0, 8).toUpperCase()}\`,`;
          
const replacement1 = `        const { data: customerData, error: customerErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [customerEmail],
          subject: \`Order Confirmation - #\${String(orderId).slice(0, 8).toUpperCase()}\`,`;

const target2 = `        });
      } catch (err) {
        console.error("Failed to send customer email:", err);
      }`;
      
const replacement2 = `        });
        if (customerErr) {
          console.error("[Resend API Error - Customer]:", customerErr);
        }
      } catch (err) {
        console.error("Failed to send customer email:", err);
      }`;

const target3 = `        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [adminEmail],
          subject: \`New Order Received - #\${String(orderId).slice(0, 8).toUpperCase()}\`,`;

const replacement3 = `        const { data: adminData, error: adminErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [adminEmail],
          subject: \`New Order Received - #\${String(orderId).slice(0, 8).toUpperCase()}\`,`;
          
const target4 = `        });
      } catch (err) {
         console.error("Failed to send admin email:", err);
      }`;
      
const replacement4 = `        });
        if (adminErr) {
          console.error("[Resend API Error - Admin]:", adminErr);
        }
      } catch (err) {
         console.error("Failed to send admin email:", err);
      }`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);
code = code.replace(target4, replacement4);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with better resend error handling");
