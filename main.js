// TODO
// 1. Event handlers for when filter is changed to each option (start with ASCII)
// 2. Add handler to add current canvas data to gallery.
// 3. Add code to display gallery images
// 4. Add forms for each filter effect that pop up when selected (Ex: for ASCII, let user enter charSize, fontSize and charColor)
// 5. Add button to clear canvas and remove filter options/gal-button
// 6. Add code for importing image(s) into gallery, exporting image(s)/text file(s), settings form, and instructions tab
// 7. Add method to resize image (within min and max bounds)
// 8. Add code and menu option for animations that include form for user to select desired frames and enter time elapsed between them.

const buttons = document.querySelectorAll('.menu-option');
const sButtons = document.querySelectorAll('.sidebar-button');
const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menu');
const canvas = document.getElementById('canvas');
const fileInput = document.getElementById('fileInput');
const filter = document.getElementById("filter");
const ctx = canvas.getContext('2d');

ctx.fillStyle = "white";
fileInput.value = "";

let image;
let imageW = 0;
let imageH = 0;
let imageX = 0;
let imageY = 0;
let chars = [];

let rgbaData = new Array(canvas.height);
for (let i = 0; i < canvas.height; i++)
    rgbaData[i] = new Array(canvas.width);



// Set button text to hidden initially.
sButtons.forEach(button => {
    const text = button.querySelector('h3');
    text.style.display = 'none';
});

// Give all buttons handlers for hovering on and off to change color
buttons.forEach(button => {
    const img = button.querySelector('img');
    const filename = button.id;

    // Hover handler
    button.addEventListener('mouseover', () => {
        img.src = 'icons/' + filename + '.png';
        const text = button.querySelector('h3');
        text.classList.add("selected-sidebar-button");
    });

    // Remove hover handler
    button.addEventListener('mouseout', () => {
        img.src = 'icons/' + filename + '-selected.png';
        const text = button.querySelector('h3');
        text.classList.remove("selected-sidebar-button");
    });
});

// Give menu button handler to toggle expanded menu text
menuButton.addEventListener('click', () => {
    sidebar.classList.toggle('expand-animation');

    sButtons.forEach(button => {
        const text = button.querySelector('h3');

        if (text.style.display === 'none')
            text.style.display = 'block';
        else
            text.style.display = 'none';
    });
});

// Give each button handler to navigate to correct page or open form

// Validate file to check if it is valid image or video file
// Load image or video file into memory
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file

    if (file && file.type.startsWith('image/')) { // Check if the file is an image
        const reader = new FileReader(); // Create a new FileReader instance

        // Event handler for when the file is successfully read
        reader.onload = function(e) {
            img = new Image(); // Create a new Image object

            // Event handler for when the image is successfully loaded
            img.onload = function() {
                // Clear any previous drawings on the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw the image onto the canvas
                imageW = (img.width * canvas.height) / img.height;
                imageH = canvas.height - 20;

                if (imageW > canvas.width)
                {
                    imageW = canvas.width;
                    imageH = imageH * canvas.width / imageW;
                }

                imageX = (canvas.width - imageW) / 2;
                imageY = 10;
                ctx.drawImage(img, imageX, imageY, imageW, imageH);

                const filters = document.getElementById("filt-box");
                const galButton = document.getElementById("gal-button");
                filters.classList.remove("hidden");
                galButton.classList.remove("hidden");

                getRgbaData(ctx.getImageData(0, 0, canvas.width, canvas.height));



                for (let i = 0; i < canvas.height; i++) {
                    chars[i] = [];
                    for (let j = 0; j < canvas.width; j++) {
                        chars[i][j] = 'q';
                    }
                }

                filter.value = "none";
            };

            // Set the source of the image to the data URL from FileReader
            img.src = e.target.result;
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);
    } else {
        alert('Please select a valid image file.'); // Error handling if the file is not an image
    }
});

filter.addEventListener('change', function(event) {
    console.log(event.target.value)
    if (event.target.value == 'none')
        ctx.drawImage(img, imageX, imageY, imageW, imageH);
    else if (event.target.value == "ascii")
    {
        generateForm('a');
    }
    else if (event.target.value = "grayscale")
        grayscale();
});

// Extract RGBA data from canvas
function getRgbaData(imgData) {
    let counter = 0;
    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            let px = [0, 0, 0, 0];
            px[0] = imgData.data[counter];     // R
            px[1] = imgData.data[counter + 1]; // G
            px[2] = imgData.data[counter + 2]; // B
            px[3] = imgData.data[counter + 3]; // A
            rgbaData[i][j] = px;
            counter += 4; // Move to the next pixel (each pixel is 4 values: RGBA)
        }
    }
}

// ASCII filter
// Get average grayscale values for each box of pixels and map grayscale values to ASCII chars.
function convertToAscii(charSize, fontSize)
{
    console.log(fontSize);
    let charRow = 0, charCol = 0;
    let c;
    let avg, rAvg, gAvg, bAvg;

    for (let i = 0; i < canvas.height; i += charSize)
    {
        for (let j = 0; j < canvas.width; j += charSize)
        {
            avg = 0, rAvg = 0, gAvg = 0, bAvg = 0, c = 0;

            // Iterate image 1 box at a time
            for (let k = i; k < i + charSize; k++)
            {
                for (let l = j; l < j + charSize; l++)
                {
                    if (k < canvas.height && l < canvas.width)
                        {
                            rAvg += rgbaData[k][l][0];
                            gAvg += rgbaData[k][l][1];
                            bAvg += rgbaData[k][l][2];
                            c++;
                        }
                }
            }

            rAvg /= c;
            gAvg /= c;
            bAvg /= c;

            // Calculate avg value for entire block and add corresponding ASCII char to char array..
            avg = (rAvg + gAvg + bAvg) / 3;

            charRow = Math.ceil(i / charSize);
            charCol = Math.ceil(j / charSize);

            if (avg >= 0 && avg < 17)
                chars[charRow][charCol] = ' ';
            else if (avg >= 17 && avg < 34)
                chars[charRow][charCol] = '.';
            else if (avg >= 34 && avg < 51)
                chars[charRow][charCol] = ',';
            else if (avg >= 51 && avg < 68)
                chars[charRow][charCol] = '-';
            else if (avg >= 68 && avg < 85)
                chars[charRow][charCol] = '^';
            else if (avg >= 85 && avg < 102)
                chars[charRow][charCol] = '*';
            else if (avg >= 102 && avg < 119)
                chars[charRow][charCol] = '+';
            else if (avg >= 119 && avg < 136)
                chars[charRow][charCol] = ':';
            else if (avg >= 136 && avg < 153)
                chars[charRow][charCol] = ';';
            else if (avg >= 153 && avg < 170)
                chars[charRow][charCol] = '=';
            else if (avg >= 170 && avg < 187)
                chars[charRow][charCol] = '%';
            else if (avg >= 187 && avg < 204)
                chars[charRow][charCol] = '$';
            else if (avg >= 204 && avg < 221)
                chars[charRow][charCol] = '#';
            else if (avg >= 221 && avg < 238)
                chars[charRow][charCol] = '&';
            else
                chars[charRow][charCol] = '@';
        }
    }

    let x = 0;
    let y = 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < canvas.height && y < canvas.height - 10; i++)
    {
        for (let j = 0; j < canvas.width && x < canvas.width; j++)
        {
            ctx.fillStyle = 'white';
            ctx.font = `${fontSize}px courier`
            ctx.fillText(chars[i][j], x, y);
            x += charSize;
        }
        x = 0;
        y += charSize;
    }
}

function generateForm(filter)
{
    switch (filter)
    {
        case 'a':
        {
            const form = document.getElementById("ascii-form");
            const charInput = document.getElementById("char-size");
            const fontInput = document.getElementById("font-size");
            const submit = document.getElementById("ascii-submit");
            form.style.visibility = "visible";

            submit.addEventListener("click", () => {
                const charSize = parseInt(charInput.value);
                const fontSize = parseInt(fontInput.value);
                convertToAscii(charSize, fontSize);
                form.style.visibility = "hidden";
                charInput.value = "";
                fontInput.value = "";
            });
        }
    }
}

// ! For each method that edits rgbaData and then needs to redraw it to canvas, convert rgbaData to flat array first.

// TODO
// 0. Add rest of filters and implement menu button functionality.
// 1. Initially load page with only file selector.
// 2. When file is selected, get its pixel data, display filter options, automatically have set filter to NONE, and ask to save to gallery
// 3. When image is displayed, draw draggable border around it. Any time this border is dragged, scale image accordingly.
// 3. If user saves to gallery, add it to gallery and update recently added
// 4. When user selects a filter option, run the associated method.
// 5. If different file is selected, repeat from step 2