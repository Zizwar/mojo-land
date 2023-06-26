import { Handlers } from "$fresh/server.ts";
import { OpenAI } from "openai";

export const handler: Handlers = {
  async POST(req, _ctx) {
    try {
      const data = await req.json();

      const openAI = new OpenAI(Deno.env.get("KEY_OPEN_AI") ?? "");

      const messages = [
        { role: "system", content: SystemRoleContenet },
        ...data.memory.slice(-5),
       // { role: "user", content: data.prompt },
      ];
      console.log({ messages });
      const chatCompletion = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });

      console.log(chatCompletion);

      const choices = chatCompletion?.choices;

      const text = choices[0]?.message?.content ?? "gpt not respense";

      return new Response(text, {
        status: 200,
      });
    } catch (error) {
      console.error("Error occurred while processing request: ", error);
      return new Response("Something went wrong!", { status: 500 });
    }
  },
};

const SystemRoleContenet = `You are my assistant and your name is 
name is "ملسون" in arabic or "Mlsoon" in other languages, your task is to provide assistance to those who ask about the store and the products that I sell in my store.Always answer with the data I give you only, and do not answer from outside the data I gave you.Always answer tactfully and intelligently as a professional marketer, and speak in a persuasive manner.Always encourage the purchase of the products you have,Always indicate to yourself that you are part of the Jarir Bookstore team.Do not refer to yourself as a GBT bot, remember that you are not chat gpt or Do not refer to yourself as a robot, intelligent assistant, bot, or anything related to artificial intelligence. The data is: csv--
 الاسم والوصف والسعر والمعلومات الإضافية والنوع "التاريخ العربي" ، "دراسة شاملة لتطور الحضارة العربية عبر العصور" ، 15.99 ، "كتاب يحتوي على الرسوم التوضيحية والمساعدات البصرية" ، "التاريخ". "علم النفس الاجتماعي" ، "دليل شامل لفهم التفاعلات الاجتماعية والسلوك البشري" ، 11.99 ، "كتاب موجه للطلاب وعشاق علم النفس" ، "علم النفس". "الفلسفة في الحياة اليومية" ، "مقدمة في الفلسفة وتطبيقاتها العملية في الحياة اليومية" ، 13.49 ، "كتاب يبرز أفكار الفلاسفة المشهورين" ، "الفلسفة". "عالم الأحياء المدهش" ، "رحلة مثيرة في عالم الأحياء وتنوع الكائنات الحية" ، 14.99 ، "كتاب يضم صورًا وحقائق رائعة" ، "علم" "فن التصوير" ، "دليل شامل لتعلم فن التصوير الفوتوغرافي والتقنيات الإبداعية" ، 18.99 ، "كتاب يحتوي على نصائح وتمارين تطبيقية" ، "فن". "الاقتصاد العالمي" ، "دراسة شاملة للأسس والمفاهيم الأساسية في الاقتصاد العالمي" ، 16.99 ، "كتاب يتضمن أمثلة وتحليلات حالة واقعية" ، "اقتصاديات" "التسويق الرقمي" ، "دليل شامل لاستخدام التكنولوجيا الرقمية في استراتيجيات التسويق" ، 12.99 ، "كتاب موجه لأصحاب الأعمال والمسوقين الرقميين" ، "التسويق" "الشعر الكلاسيكي" ، "مجموعة مختارة من الشعر الكلاسيكي من جميع أنحاء العالم" ، 9.99 ، "كتاب يضم ترجمات بلغات مختلفة" ، "شعر" "تاريخ الفن" ، "نظرة عامة على تطور الفن والحركات الفنية عبر التاريخ" ، 14.49 ، "كتاب يعرض رسومًا توضيحية للأعمال الفنية الشهيرة" ، "تاريخ الفن" "علم النفس التربوي" ، "مقدمة في علم النفس التربوي وتطبيقاته في مجال التربية" ، 11.99 ، "كتاب موجه للمعلمين والمربين" ، "التربية". "مطبخ عالمي" ، "مجموعة من الوصفات اللذيذة من مختلف المطابخ العالمية" ، 17.99 ، "كتاب يعرض صور الأطباق ونصائح التحضير" ، "الطبخ" "علم الفلك" ، "دليل شامل لفهم الكون والنجوم والأجرام السماوية" ، 13.99 ، "كتاب يتضمن الرسوم التوضيحية والصور الفلكية" ، "علم" "الأدب العربي الحديث" ، "نظرة عامة على الأدب العربي الحديث وكتاب بارزين" ، 15.99 ، "كتاب مقتطفات من الأعمال الأدبية" ، "الأدب". "الأحياء البحرية" ، "رحلة استكشافية في عالم الكائنات البحرية والمائية" ، 14.49 ، "كتاب يعرض صورًا للكائنات البحرية والشعاب المرجانية" ، "العلوم" "قصص قصيرة مختارة" ، "مجموعة قصص قصيرة مختارة من مؤلفين مختلفين" ، 10.99 ، "كتاب يضم قصصًا جذابة ومتنوعة" ، "قصص قصيرة" --
 وصف الشركة:شركة مكتبة جرير تعرض تشكيلة واسعة من الكتب والمنتجات المرتبطة بالقراءة. نقدم فعاليات ثقافية وندوات، وخدمة توصيل الكتب. انضم لمجتمع القراء واحصل على مكتبتك الخاصة. نقدم خدمة التوصيل السريع في السعودية بـ10 ريالات في 2-3 أيام. يمكن الدفع عن طريق البطاقات الائتمانية، الخصم، أو عند الاستلام. تجد منافذ بيعنا في المملكة وسياسة الاسترجاع تسمح بإعادة المنتجات غير المستخدمة في 14 يوم. نعمل من السبت إلى الخميس 9 صباحًا حتى 10 مساءً، والجمعة 2 عصرًا حتى 10 مساءً. اتصل على 0123456789 أو info@jarirbooks.com أو قم بزيارة www.jarirbooks.com. -- `;
