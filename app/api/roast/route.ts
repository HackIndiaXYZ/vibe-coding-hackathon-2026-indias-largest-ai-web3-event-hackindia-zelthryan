import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY environment variable is required." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const { resume } = await request.json();

    if (!resume || resume.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume too short. Give me something real to roast!" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the world's most savage resume critic. You've reviewed 10,000+ resumes for top companies like Google, Tesla, and startups. Your job is to ROAST this resume hilariously and brutally.

RULES:
- Be funny, harsh, and specific. Point out exact weak phrases from the resume.
- Attack clichés: "team player," "hardworking," "passionate," "quick learner," listing Microsoft Office as a skill in 2026.
- Mock formatting fails, vague achievements, missing numbers/metrics, and obvious exaggerations.
- Use humor: metaphors, pop culture references, savage comparisons, Gen Z language.
- After the roast, give EXACTLY 3 specific, actionable fixes — each under 15 words, practical, numbered.
- Give a "Burn Score" from 1-10 where 1 = completely destroyed and unhireable, 10 = nearly perfect.

Return your response in this EXACT JSON format (no markdown, no extra text, just valid JSON):
{
  "roast": "the full hilarious roast text here (2-3 paragraphs)",
  "score": 5,
  "fixes": ["fix one here", "fix two here", "fix three here"]
}

Make the roast so entertaining that people want to share it on LinkedIn and Twitter. The harsher and funnier, the better. Use specific details from their resume to make the roast personal and accurate.`;

    const models = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];
    let response;
    let lastError: any = null;

    for (const model of models) {
      try {
        response = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Roast this resume brutally:\n\n${resume}` },
          ],
          temperature: 0.95,
          max_tokens: 800,
        });
        break;
      } catch (err: any) {
        lastError = err;
        const quotaIssue =
          err?.status === 429 ||
          err?.code === "insufficient_quota" ||
          err?.type === "insufficient_quota" ||
          /quota|exceeded/i.test(err?.message || "");

        if (!quotaIssue || model === models[models.length - 1]) {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Unable to roast resume at this time.");
    }

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({
      roast: content,
      score: 5,
      fixes: [
        "Add specific metrics to every bullet point",
        "Delete every cliché buzzword immediately",
        "Tailor this resume to one specific job role",
      ],
    });
  } catch (error: any) {
    console.error("Roast error:", error);

    const isQuota =
      error?.status === 429 ||
      error?.code === "insufficient_quota" ||
      /quota|exceeded/i.test(error?.message || "");

    if (isQuota) {
      const demoRoast = `Demo Roast: Your resume reads like a corporate slogan generator—lots of "passionate" and zero numbers. It looks like you Taylor-swiftly copied job descriptions and called it "experience."`;
      return NextResponse.json(
        {
          roast: demoRoast,
          score: 4,
          fixes: [
            "Add 2-3 concrete metrics per role",
            "Remove vague buzzwords and verbs",
            "Tailor bullets to one job, not every job",
          ],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Roast machine broke. Try again." },
      { status: 500 }
    );
  }
}
