import mongoose from "mongoose";
import { Problem } from "./problem.model.js"; // adjust path as per your project
import slugify from "slugify";

// MongoDB connection


const problems = [
  {
    title: "Word Break II",
    statement:
      "Given a string s and a dictionary of words, add spaces in s to construct all possible sentences where each word is in the dictionary.",
    difficulty: "Hard",
    tags: ["DP", "Backtracking"],
    constraints: "1 <= s.length <= 20, 1 <= wordDict.length <= 1000",
    testCases: [
      {
        input: 's = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]',
        output: '["cats and dog","cat sand dog"]',
        isSample: true,
      },
      {
        input:
          's = "pineapplepenapple", wordDict = ["apple","pen","applepen","pine","pineapple"]',
        output:
          '["pine apple pen apple","pineapple pen apple","pine applepen apple"]',
      },
    ],
  },
  {
    title: "Sliding Window Maximum",
    statement:
      "Given an array nums and a sliding window of size k, return the maximum value in each window.",
    difficulty: "Hard",
    tags: ["Heap", "Deque"],
    constraints: "1 <= nums.length <= 10^5, 1 <= k <= nums.length",
    testCases: [
      {
        input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        output: "[3,3,5,5,6,7]",
        isSample: true,
      },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
  },
  {
    title: "Minimum Window Substring",
    statement:
      "Given two strings s and t, return the minimum window substring of s that contains all the characters of t.",
    difficulty: "Hard",
    tags: ["Sliding Window", "HashMap"],
    constraints: "1 <= s.length, t.length <= 10^5",
    testCases: [
      {
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        isSample: true,
      },
      { input: 's = "a", t = "a"', output: '"a"' },
    ],
  },
  {
    title: "N-Queens",
    statement:
      "The n-queens puzzle is the problem of placing n queens on an n×n chessboard such that no two queens attack each other.",
    difficulty: "Hard",
    tags: ["Backtracking"],
    constraints: "1 <= n <= 9",
    testCases: [
      {
        input: "n = 4",
        output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
        isSample: true,
      },
      { input: "n = 1", output: '[["Q"]]' },
    ],
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    statement:
      "Design an algorithm to serialize and deserialize a binary tree.",
    difficulty: "Hard",
    tags: ["Tree", "Design"],
    constraints: "The number of nodes is in the range [0, 10^4].",
    testCases: [
      {
        input: "root = [1,2,3,null,null,4,5]",
        output: "[1,2,3,null,null,4,5]",
        isSample: true,
      },
      { input: "root = []", output: "[]" },
    ],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    statement:
      "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    tags: ["HashMap", "Sliding Window"],
    constraints: "0 <= s.length <= 5 * 10^4",
    testCases: [
      { input: 's = "abcabcbb"', output: "3", isSample: true },
      { input: 's = "bbbbb"', output: "1" },
    ],
  },
  {
    title: "Product of Array Except Self",
    statement:
      "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements except nums[i].",
    difficulty: "Medium",
    tags: ["Array", "Prefix Sum"],
    constraints: "2 <= nums.length <= 10^5, -30 <= nums[i] <= 30",
    testCases: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", isSample: true },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
    ],
  },
  {
    title: "Binary Tree Level Order Traversal",
    statement:
      "Given the root of a binary tree, return the level order traversal of its nodes' values.",
    difficulty: "Medium",
    tags: ["Tree", "BFS"],
    constraints: "The number of nodes is in the range [0, 2000].",
    testCases: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        isSample: true,
      },
      { input: "root = [1]", output: "[[1]]" },
    ],
  },
  {
    title: "Number of Islands",
    statement: "Given an m x n 2D binary grid, return the number of islands.",
    difficulty: "Medium",
    tags: ["DFS", "BFS", "Union Find"],
    constraints: "1 <= m, n <= 300",
    testCases: [
      {
        input: "grid = [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]",
        output: "1",
        isSample: true,
      },
      { input: "grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,0,1,1]]", output: "2" },
    ],
  },
  {
    title: "Course Schedule",
    statement:
      "There are a total of numCourses courses you have to take. Some courses may have prerequisites. Return true if you can finish all courses.",
    difficulty: "Medium",
    tags: ["Graph", "Topological Sort"],
    constraints: "1 <= numCourses <= 2000",
    testCases: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        isSample: true,
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
      },
    ],
  },
  {
    title: "Coin Change",
    statement:
      "You are given coins of different denominations and an amount. Return the fewest number of coins that make up that amount.",
    difficulty: "Medium",
    tags: ["DP"],
    constraints: "1 <= coins.length <= 12, 1 <= amount <= 10^4",
    testCases: [
      { input: "coins = [1,2,5], amount = 11", output: "3", isSample: true },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
  },
  {
    title: "Rotting Oranges",
    statement:
      "Given a grid where each cell is an orange (0=empty,1=fresh,2=rotten), return the minimum number of minutes until no fresh orange remains.",
    difficulty: "Medium",
    tags: ["BFS"],
    constraints: "1 <= grid.length, grid[i].length <= 10",
    testCases: [
      {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        output: "4",
        isSample: true,
      },
      { input: "grid = [[0,2]]", output: "0" },
    ],
  },
  {
    title: "Longest Palindromic Substring",
    statement:
      "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Medium",
    tags: ["DP", "String"],
    constraints: "1 <= s.length <= 1000",
    testCases: [
      { input: 's = "babad"', output: '"bab"', isSample: true },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
  },
  {
    title: "Subsets",
    statement:
      "Given an integer array nums of unique elements, return all possible subsets.",
    difficulty: "Medium",
    tags: ["Backtracking", "Bitmasking"],
    constraints: "1 <= nums.length <= 10, -10 <= nums[i] <= 10",
    testCases: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
        isSample: true,
      },
      { input: "nums = [0]", output: "[[],[0]]" },
    ],
  },
  {
    title: "Top K Frequent Elements",
    statement:
      "Given an integer array nums and an integer k, return the k most frequent elements.",
    difficulty: "Medium",
    tags: ["Heap", "HashMap"],
    constraints: "1 <= nums.length <= 10^5, k in [1, nums.length]",
    testCases: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", isSample: true },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
  },
  {
    title: "Two Sum",
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    tags: ["Array", "HashMap"],
    constraints:
      "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
    testCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        isSample: true,
      },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
  },
  {
    title: "Reverse Linked List",
    statement: "Reverse a singly linked list.",
    difficulty: "Easy",
    tags: ["LinkedList"],
    constraints:
      "The number of nodes in the list is in the range [0, 5000]. -5000 <= Node.val <= 5000",
    testCases: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", isSample: true },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
  },
  {
    title: "Valid Parentheses",
    statement:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    constraints: "1 <= s.length <= 10^4",
    testCases: [
      { input: 's = "()"', output: "true", isSample: true },
      { input: 's = "(]"', output: "false" },
    ],
  },
  {
    title: "Merge Two Sorted Lists",
    statement: "Merge two sorted linked lists and return it as a sorted list.",
    difficulty: "Easy",
    tags: ["LinkedList"],
    constraints:
      "The number of nodes in both lists is in the range [0, 50]. -100 <= Node.val <= 100",
    testCases: [
      {
        input: "l1 = [1,2,4], l2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        isSample: true,
      },
      { input: "l1 = [], l2 = []", output: "[]" },
    ],
  },
  {
    title: "Maximum Subarray",
    statement: "Find the contiguous subarray which has the largest sum.",
    difficulty: "Easy",
    tags: ["Array", "DP"],
    constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
    testCases: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", isSample: true },
      { input: "nums = [1]", output: "1" },
    ],
  },

  // 🔹 Medium Problems
  {
    title: "3Sum",
    statement:
      "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0.",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    constraints: "3 <= nums.length <= 3000, -10^5 <= nums[i] <= 10^5",
    testCases: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        isSample: true,
      },
      { input: "nums = [0,1,1]", output: "[]" },
    ],
  },
  {
    title: "Add Two Numbers",
    statement:
      "You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.",
    difficulty: "Medium",
    tags: ["LinkedList", "Math"],
    constraints:
      "The number of nodes in each linked list is in the range [1, 100]. 0 <= Node.val <= 9",
    testCases: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        isSample: true,
      },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
    ],
  },
  {
    title: "Group Anagrams",
    statement: "Given an array of strings, group anagrams together.",
    difficulty: "Medium",
    tags: ["HashMap", "Sorting"],
    constraints: "1 <= strs.length <= 10^4, 0 <= strs[i].length <= 100",
    testCases: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        isSample: true,
      },
      { input: 'strs = [""]', output: '[[""]]' },
    ],
  },
  {
    title: "Word Search",
    statement:
      "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
    difficulty: "Medium",
    tags: ["Backtracking", "DFS"],
    constraints:
      "1 <= board.length, board[i].length <= 6, 1 <= word.length <= 15",
    testCases: [
      {
        input:
          'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
        output: "true",
        isSample: true,
      },
      { input: 'board = [["A","B"],["C","D"]], word = "ACDB"', output: "true" },
    ],
  },

  // 🔹 Hard Problems
  {
    title: "Median of Two Sorted Arrays",
    statement:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "Hard",
    tags: ["Binary Search", "Array", "Divide and Conquer"],
    constraints: "0 <= m, n <= 1000, 1 <= m + n <= 2000",
    testCases: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", isSample: true },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5" },
    ],
  },
  {
    title: "Regular Expression Matching",
    statement:
      "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
    difficulty: "Hard",
    tags: ["DP", "String"],
    constraints: "1 <= s.length <= 20, 1 <= p.length <= 30",
    testCases: [
      { input: 's = "aa", p = "a"', output: "false", isSample: true },
      { input: 's = "aa", p = "a*"', output: "true" },
    ],
  },
  {
    title: "Trapping Rain Water",
    statement:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap.",
    difficulty: "Hard",
    tags: ["Two Pointers", "Stack", "DP"],
    constraints:
      "n == height.length, 1 <= n <= 2 * 10^4, 0 <= height[i] <= 10^5",
    testCases: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        isSample: true,
      },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
  },
  {
    title: "Best Time to Buy and Sell Stock",
    statement:
      "Given an array prices where prices[i] is the price of a stock on the ith day, return the maximum profit you can achieve from one transaction.",
    difficulty: "Easy",
    tags: ["Array", "Greedy"],
    constraints: "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4",
    testCases: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", isSample: true },
      { input: "prices = [7,6,4,3,1]", output: "0" },
    ],
  },
  {
    title: "Climbing Stairs",
    statement:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. Return the number of distinct ways.",
    difficulty: "Easy",
    tags: ["DP"],
    constraints: "1 <= n <= 45",
    testCases: [
      { input: "n = 2", output: "2", isSample: true },
      { input: "n = 3", output: "3" },
    ],
  },
  {
    title: "Maximum Depth of Binary Tree",
    statement: "Given the root of a binary tree, return its maximum depth.",
    difficulty: "Easy",
    tags: ["Tree", "DFS", "BFS"],
    constraints: "The number of nodes in the tree is in the range [0, 10^4].",
    testCases: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3", isSample: true },
      { input: "root = []", output: "0" },
    ],
  },
  {
    title: "Valid Palindrome",
    statement:
      "Given a string s, return true if it is a palindrome, ignoring non-alphanumeric characters and case.",
    difficulty: "Easy",
    tags: ["String", "Two Pointers"],
    constraints: "1 <= s.length <= 2 * 10^5",
    testCases: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        isSample: true,
      },
      { input: 's = "race a car"', output: "false" },
    ],
  },
  {
    title: "Implement Queue using Stacks",
    statement:
      "Implement a first in first out (FIFO) queue using only two stacks.",
    difficulty: "Easy",
    tags: ["Stack", "Design"],
    constraints:
      "Calls to push, pop, peek, and empty are valid. Up to 100 operations.",
    testCases: [
      {
        input:
          "MyQueue queue = new MyQueue(); queue.push(1); queue.push(2); queue.peek()",
        output: "1",
        isSample: true,
      },
      { input: "queue.pop()", output: "1" },
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Problem.deleteMany({});

    const problemsWithSlugs = problems.map((problem) => ({
      ...problem,
      slug: slugify(problem.title, { lower: true, strict: true }),
    }));

    await Problem.insertMany(problemsWithSlugs);
    console.log("✅ Database seeded with problems!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};
// seedDB();

/**
 * 

 */
