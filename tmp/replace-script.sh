#!/bin/bash

# Get the content from line 747 to the beginning of the use-case tab
head -n 746 client/src/pages/kastle-video-guarding-page.tsx > tmp/first-part.txt

# Get the content after the use-case tab
awk 'NR>1520' client/src/pages/kastle-video-guarding-page.tsx > tmp/third-part.txt

# Combine the parts
cat tmp/first-part.txt tmp/use-case-tab-fixed.tsx tmp/third-part.txt > tmp/combined.txt

# Replace the original file
cp tmp/combined.txt client/src/pages/kastle-video-guarding-page.tsx

echo "File successfully replaced"