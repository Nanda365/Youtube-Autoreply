import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface HashtagResult {
  facebook: string;
  instagram: string;
  tiktok: string;
}

interface MockData {
  [hashtag: string]: HashtagResult;
}

const mockHashtagData: MockData = {
  '#coding': {
    facebook: `**Top Communities:** Code_Devs, Programming Hub
**Trending Topics:** AI in Python, WebDev Challenges, JavaScript Frameworks
**Popular Pages:** Meta Developers, Stack Overflow`,
    instagram: `**Popular Creators:** @cleverprogrammer, @coding.engineer, @womenwhocode
**Visual Trends:** Clean code aesthetics, Desk setups, Coding memes
**Challenges:** #100DaysOfCode, #CodeEveryDay`,
    tiktok: `**Short Tutorials:** Python basics, CSS tricks, JavaScript one-liners
**Dev Humor:** Debugging struggles, Coding life memes
**Popular Sounds:** Coding motivation, AI-generated music`,
  },
  '#travel': {
    facebook: `**Groups:** Backpackers World, Digital Nomads Global, Travel Deals & Discounts
**Tips & Guides:** Budget travel hacks, Visa requirements, Local cuisine guides
**Events:** Local festivals, Adventure tours`,
    instagram: `**Visuals:** Scenic landscapes, Cityscapes, Food photography
**Influencers:** @travel_lens, @wanderlust_diaries, @explore_with_me
**Hashtags:** #TravelGram, #Wanderlust, #Explore`,
    tiktok: `**Quick Guides:** 1-minute city tours, Packing hacks, Travel safety tips
**Experiences:** Cultural immersions, Adventure sports highlights
**Challenges:** #TravelChallenge, #BucketListAdventures`,
  },
  '#foodie': {
    facebook: `**Recipes:** Healthy eating, International cuisine, Dessert recipes
**Restaurants:** Local reviews, New openings, Food festivals
**Cooking Tips:** Meal prep ideas, Kitchen hacks`,
    instagram: `**Food Photography:** Aesthetic dishes, Restaurant aesthetics, Food flatlays
**Bloggers:** @food_lover_diary, @tasty_bites, @gourmet_journey
**Trends:** #FoodPorn, #InstaFood, #RecipeOfTheDay`,
    tiktok: `**Quick Recipes:** 15-second meals, Dessert hacks, Snack ideas
**Food Challenges:** Eating contests, Unique food combinations
**Reviews:** Street food, Fast food ratings`,
  },
  '#gemini': {
    facebook: `**Discussions:** AI ethics, Machine learning trends, Future of AI
**Updates:** Google AI news, Gemini model advancements, Research papers
**Groups:** AI Enthusiasts, Machine Learning Community`,
    instagram: `**AI Art:** Generative art, AI-enhanced photography, Digital creations
**Infographics:** Gemini features explained, AI facts
**Showcases:** AI applications, Robotics, Future tech`,
    tiktok: `**AI Explanations:** Gemini model explained in 60 seconds, AI myths debunked
**Tech Reviews:** Gadgets featuring AI, Smart home tech
**Creative Prompts:** AI art challenges, Text-to-image demos`,
  },
};

export default function HashtagSearch() {

  const [searchTag, setSearchTag] = useState('');

  const [results, setResults] = useState<HashtagResult | null>(null);

  const [message, setMessage] = useState('');

  const [repurposedContent, setRepurposedContent] = useState<string | null>(null); // New state for repurposed content



  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault();

    setMessage('');

    setResults(null);

    setRepurposedContent(null); // Clear repurposed content on new search



    const formattedTag = searchTag.toLowerCase().startsWith('#') ? searchTag.toLowerCase() : `#${searchTag.toLowerCase()}`;

    

    if (mockHashtagData[formattedTag]) {

      setResults(mockHashtagData[formattedTag]);

    } else {

      setMessage(`No results found for "${formattedTag}". Try #coding, #travel, #foodie, or #gemini.`);

    }

  };



  const handleRepurpose = () => {

    if (!results || !searchTag) return;



        // Derive the word part of the tag, handling cases where '#' might be missing from input



        const tagWord = searchTag.startsWith('#') ? searchTag.substring(1) : searchTag;



    



        let generatedContent = `--- Repurposed Content for "${searchTag}" ---\n\n`;



    



        generatedContent += `**Overall Theme:** Focus on ${tagWord} related content.\n\n`;



    



        generatedContent += `**Facebook Idea:** Create a poll or discussion post based on "${tagWord}".\n`;



        generatedContent += `   - Example: "What's your favorite aspect of ${tagWord} on Facebook? Share your thoughts below!"\n\n`;



    



        generatedContent += `**Instagram Idea:** Design a visually appealing infographic or short reel.\n`;



        generatedContent += `   - Example: "Showcase 3 quick tips for ${tagWord} with eye-catching visuals."\n\n`;



    



        generatedContent += `**TikTok Idea:** Create a trending sound or challenge related to "${tagWord}".\n`;



        generatedContent += `   - Example: "Join the #${tagWord}Challenge! Show us your best ${tagWord} moments in 15 seconds."\n\n`;

    

    generatedContent += `**Cross-Platform Call to Action:** "Engage your audience across platforms with these tailored ideas!"\n\n`;



    generatedContent += `--- End Repurposed Content ---`;



    setRepurposedContent(generatedContent);

  };



  return (

    <DashboardLayout>

      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-foreground">Hashtag Search</h2>

        <p className="text-muted-foreground">Search for popular hashtags across social media platforms (mock data).</p>



        <Card className="border-border">

          <CardContent className="p-6">

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">

              <div className="flex-1">

                <Label htmlFor="hashtag-input" className="sr-only">Search Hashtag</Label>

                <Input

                  id="hashtag-input"

                  type="text"

                  placeholder="e.g., #coding or coding"

                  value={searchTag}

                  onChange={(e) => setSearchTag(e.target.value)}

                  className="w-full"

                />

              </div>

              <Button type="submit" className="w-full md:w-auto">Search</Button>

            </form>

          </CardContent>

        </Card>



        {message && (

          <div className="text-center text-muted-foreground p-4 bg-secondary/20 rounded-lg">

            {message}

          </div>

        )}



        {results && (

          <Card className="border-border">

            <CardHeader>

              <CardTitle>Results for {searchTag}</CardTitle>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"> {/* Added mb-6 for spacing */}

                {/* Headers */}

                <div className="text-lg font-semibold text-foreground">Facebook</div>

                <div className="text-lg font-semibold text-foreground">Instagram</div>

                <div className="text-lg font-semibold text-foreground">TikTok</div>

                

                {/* Content */}

                <div className="text-sm text-foreground space-y-2"> {/* Facebook Column */}

                  {results.facebook.split('\n').map((line, index) => (

                    <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>

                  ))}

                </div>

                <div className="text-sm text-foreground space-y-2"> {/* Instagram Column */}

                  {results.instagram.split('\n').map((line, index) => (

                    <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>

                  ))}

                </div>

                <div className="text-sm text-foreground space-y-2"> {/* TikTok Column */}

                  {results.tiktok.split('\n').map((line, index) => (

                    <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>

                  ))}

                </div>

              </div>

              <Button onClick={handleRepurpose}>Repurpose Content</Button> {/* Updated onClick */}

            </CardContent>

          </Card>

        )}



        {repurposedContent && ( // New display area for repurposed content

          <Card className="border-border">

            <CardHeader>

              <CardTitle>Generated Repurposed Content</CardTitle>

            </CardHeader>

            <CardContent>

              <div className="text-sm text-foreground space-y-2 whitespace-pre-wrap">

                {repurposedContent.split('\n').map((line, index) => (

                  <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>

                ))}

              </div>

            </CardContent>

          </Card>

        )}

      </div>

    </DashboardLayout>

  );

}
