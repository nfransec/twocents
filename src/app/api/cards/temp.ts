export async function PUT(request: NextRequest) {
    try {
      await connectToDatabase();
  
      const token = request.cookies.get("token")?.value || "";
      const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as { id: string };
      const userId = decodedToken.id;
  
      const body = await request.json();
      console.log('Received body:', JSON.stringify(body));
  
      try {
        const validatedData = cardUpdateSchema.parse(body);
        console.log('Validated data:', validatedData);
  
        const { _id, ...updateData } = validatedData;
  
        const updatedCard = await Card.findOneAndUpdate(
          { _id, userId },
          updateData,
          { new: true }
        );
  
        if (!updatedCard) {
          return NextResponse.json({ error: "Card not found or you don't have permission to update it" }, { status: 404 });
        }
  
        return NextResponse.json({
          message: "Card updated successfully",
          success: true,
          data: updatedCard,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Zod validation error:', error);
          const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
          return NextResponse.json({ error: errorMessage }, { status: 400 });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in PUT /api/cards:', error);
      return NextResponse.json({ error: "An error occurred while updating the card" }, { status: 500 });
    }
  }