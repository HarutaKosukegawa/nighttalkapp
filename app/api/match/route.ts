import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Participant } from '@/types/database'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { myProfile, others }: { myProfile: Participant; others: Participant[] } = await req.json()

  if (!myProfile || !others || others.length === 0) {
    return NextResponse.json({ error: '参加者情報が不足しています' }, { status: 400 })
  }

  const myText = `名前: ${myProfile.name}\n活動: ${myProfile.activity}\n夢: ${myProfile.dream}\n悩み: ${myProfile.concern}\n話したいこと: ${myProfile.want_to_talk}`
  const othersList = others.map((p) =>
    `---\n名前: ${p.name}\n活動: ${p.activity}\n夢: ${p.dream}\n悩み: ${p.concern}\n話したいこと: ${p.want_to_talk}`
  ).join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `あなたはイベントの交流サポーターです。
以下の「対象者」のプロフィールを読み、「他の参加者リスト」の中からこの人に特に話してほしい相手を3人選んで理由を教えてください。

【対象者】
${myText}

【他の参加者リスト】
${othersList}

【ルール】
- 必ず3人を選ぶ
- 「話したいこと」「悩み」「夢」「活動」が互いに補完・共鳴するかを重視する
- 理由は具体的に1〜2文で、対象者への語りかけ口調で書く
- 絵文字は使わず、シンプルに

【出力形式（この形式を厳守）】
1. [名前]
[理由]

2. [名前]
[理由]

3. [名前]
[理由]`,
      },
    ],
  })

  const result = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ result })
}
