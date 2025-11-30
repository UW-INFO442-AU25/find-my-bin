# Testing Protocol

## Testing for Quick Sort

<b>Step 1: Select a Category</b>
<ul><li>Clicking a category should move the user to the next step.</li></ul>

<b>Step 2: Select an Item Group</b>
<ul><li>Clicking an item group should bring the user to Step 3.</li>
<li>Back button should return the user to Step 1.</li></ul>



<b>Step 3: Select an Item</b>
<ul><li>Clicking an item should bring the user to Step 4.</li>
<li>Back button should return the user to Step 2.</li>
<li>If the item has a default bin (no conditions), the user should immediately see the final recommendation page.</li>
</ul>

<b>Step 4: Select Conditions</b>
<ul>
<li>All applicable conditions (cleanliness or shape) should display correctly.</li> 
<li>Condition buttons should toggle.</li>
<li>Back button should return the user to Step 3.</li>
<li>Clicking Finish Sorting should display the final bin recommendation.</li>
</ul>

<b>Bin Recommendation Page</b>
<ul><li>The correct bin (Recycle, Compost, or Landfill) should appear with the proper color and image.</li><li>The displayed item and description should match the user’s selections.</li><li>Breadcrumb navigation should accurately reflect the completed path.</li>
</ul>

## Testing for AI Image Recognition

<b>Upload an Image</b>

<ul><li>Clicking Choose File should open a file selector.</li>
<li>A preview of the chosen image should appear.</li></ul>
<b>Run Model</b>
<ul><li>The AI model should process the image without errors.</li></ul>
<b>Check Predictions</b>
<ul><li>The item should be correctly identified.</li> 
<li>Predicted labels should appear.</li> 
</ul>

## Testing for Quiz

<b>Quiz Behavior</b>

<ul><li>Items with conditions should display both cleanliness and shape options when applicable.</li> 
<li>Clicking Trash/Landfill, Recycle, or Compost should update the user’s score based on the timed points system.</li>
<li>The leaderboard should accurately reflect users with the highest points.</li> 
<li>User profiles should store points and question history correctly.</li> 
</ul>
