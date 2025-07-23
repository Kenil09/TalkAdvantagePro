import { NextResponse } from 'next/server'
import { knowledgeGraphService } from '@/lib/weaviate/knowledge-graph-service'

export async function GET() {
  try {
    // const person = await knowledgeGraphService.createPerson({
    //   name: "John Doe",
    //   type: "Person",
    //   metadata: { data: "" },
    // });

    // console.log(person);

    // const file = await knowledgeGraphService.getPersonFiles(
    //   "5fe5fac0-6e83-4eac-818c-95f9b2d8f326"
    // );

    // console.log(file);

    const per = await knowledgeGraphService.getUserContextPacks(
      'af294a11-f98a-4613-8566-ce1b89d53ddc',
    )

    console.log(per)

    return NextResponse.json(per)
  } catch (error) {
    console.error('Error in GET /test-api', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
