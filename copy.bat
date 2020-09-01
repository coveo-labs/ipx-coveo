rem aws s3 rm s3://labs.coveodemo.com/workplace/ --recursive
rem aws cloudfront create-invalidation --distribution-id E255DU5L8IK1UZ --paths "/" "/*"
rem pause
aws s3 cp o2c.html   s3://labs.coveodemo.com/workplace/ 
aws cloudfront create-invalidation --distribution-id E255DU5L8IK1UZ --paths "/" "/*"