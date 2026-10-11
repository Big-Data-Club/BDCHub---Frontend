import type { LabAuthoringProposal } from "@/types/labs/authoring";
export const specialElementsExample: LabAuthoringProposal = {
  title: "Sum of Squares of Special Elements",
  description: `## Problem\nYou are given a 1-indexed integer array nums of length n. An element nums[i] is special when i divides n (n % i == 0). Return the sum of the squares of all special elements.\n\n## Input\nOne JSON object on stdin: {"nums":[1,2,3,4]}. Indices in the problem are 1-based; array indices in code may be 0-based.\n\n## Output\nPrint one integer, with no labels or debug output.\n\n## Examples\n1. Input: {"nums":[1,2,3,4]}\n   Output: 21\n   Special indices: 1, 2, 4. Sum: 1² + 2² + 4² = 21.\n2. Input: {"nums":[2,7,1,19,18,3]}\n   Output: 63\n   Special indices: 1, 2, 3, 6. Sum: 2² + 7² + 1² + 3² = 63.\n\n## Constraints\n- 1 <= nums.length == n <= 50\n- 1 <= nums[i] <= 50`,
  starter_code: { python: `import json\nimport sys\n\ndef sum_of_squares(nums):\n    # Implement the solution using the 1-based indices from the problem.\n    raise NotImplementedError\n\nif __name__ == "__main__":\n    data = json.load(sys.stdin)\n    print(sum_of_squares(data["nums"]))\n` },
  schema_sql: "", seed_sql: "", runtime_tasks: [], warnings: [],
  test_cases: [
    { name: "Example 1", input: '{"nums":[1,2,3,4]}', expected: "21", is_sample: true, is_hidden: false, weight: 1 },
    { name: "Example 2", input: '{"nums":[2,7,1,19,18,3]}', expected: "63", is_sample: true, is_hidden: false, weight: 1 },
  ],
  generator_code: `import json, sys, random\nconfig = json.load(sys.stdin)\ni = config["index"]\nrng = random.Random(config["seed"] + i)\nif i == 0: nums = [1]\nelif i == 1: nums = [50]\nelif i == 2: nums = [1] * 50\nelif i == 3: nums = [50] * 50\nelif i == 4: nums = [1 + j for j in range(49)]\nelse:\n    n = rng.randint(2, 50)\n    nums = [rng.randint(1, 50) for _ in range(n)]\nprint(json.dumps({"nums": nums}))\n`,
  reference_code: `import json, sys\nnums = json.load(sys.stdin)["nums"]\nassert 1 <= len(nums) <= 50 and all(1 <= x <= 50 for x in nums)\nprint(sum(x*x for i,x in enumerate(nums, 1) if len(nums) % i == 0))\n`,
};
export const gitStepsExample: LabAuthoringProposal = {
  title: "Git: init, commit and branch",
  description: `## Mục tiêu\nTạo repository, commit đầu tiên và một nhánh tính năng. Workspace cần image đã cài Git.\n\n## Các bước\n1. Chạy \`git init project\`, rồi \`cd project\`.\n2. Cấu hình danh tính: \`git config user.name 'Student'\` và \`git config user.email 'student@example.test'\`.\n3. Tạo README.md chứa chuỗi \`My first repository\`.\n4. Chạy \`git add README.md\` rồi \`git commit -m 'Initial commit'\`.\n5. Chạy \`git switch -c feature/lab\`.\n\nKiểm tra từng bước trong bảng nhiệm vụ. Điểm dựa trên trạng thái Git thực tế; tất cả bước bắt buộc phải pass.`,
  starter_code: {}, schema_sql: "", seed_sql: "", test_cases: [], generator_code: "", reference_code: "",
  warnings: ["Cần provision image terminal có Git; không cài package từ mạng trong phiên học."],
  runtime_tasks: [
    { title: "Khởi tạo repository", description: "Tạo repository Git ở /workspace/project bằng git init project.", verifier_type: "COMMAND_OUTPUT", verifier_config: { command: "git -C /workspace/project rev-parse --is-inside-work-tree", expected: "true" }, weight: 20, is_required: true, order_index: 0 },
    { title: "Tạo README", description: "Tạo project/README.md chứa My first repository.", verifier_type: "FILE_CONTAINS", verifier_config: { path: "project/README.md", contains: "My first repository" }, weight: 20, is_required: true, order_index: 1 },
    { title: "Commit README", description: "Commit README với message Initial commit. File đã commit phải chứa đúng nội dung.", verifier_type: "COMMAND_EXIT", verifier_config: { command: "test \"$(git -C /workspace/project log -1 --format=%s)\" = 'Initial commit' && git -C /workspace/project show HEAD:README.md | grep -Fq 'My first repository'" }, weight: 40, is_required: true, order_index: 2 },
    { title: "Tạo nhánh tính năng", description: "Tạo và chuyển sang nhánh feature/lab.", verifier_type: "COMMAND_OUTPUT", verifier_config: { command: "git -C /workspace/project branch --show-current", expected: "feature/lab" }, weight: 20, is_required: true, order_index: 3 },
  ],
};
