import "dotenv/config";
import { supabase } from "../services/supabase.ts";
import { transporter } from "./mailer";

async function main() {

  // 1. Buscar usuários do banco
  const { data: users, error } = await supabase
    .from("alunos") // substitua pelo nome da sua tabela
    .select("id, nome, email");

  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return;
  }

  if (!users || users.length === 0) {
    console.log("Nenhum usuário encontrado.");
    return;
  }

  // 2. Enviar e-mail para cada usuário
  for (const user of users) {
    try {
      await transporter.sendMail({
        from: `"Academia" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Notificação automática",
        text: `Olá ${user.nome}, esta é uma mensagem automática.`,
      });

      console.log(`✅ Email enviado para ${user.email}`);
    } catch (err) {
      console.error(`❌ Erro ao enviar email para ${user.email}:`, err);
    }
  }
}

main();