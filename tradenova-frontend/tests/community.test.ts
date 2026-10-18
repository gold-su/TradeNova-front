import assert from "node:assert/strict";
import test from "node:test";
import { communityAuthorMeta, validateCommunityPost } from "../src/pages/community/communityView.ts";

test("community post validation rejects blank content",()=>{assert.equal(validateCommunityPost({title:" ",content:"내용"}),"제목과 내용을 입력해 주세요.");assert.equal(validateCommunityPost({title:"제목",content:"내용"}),null)});
test("community author metadata exposes level and completed training without email",()=>{const text=communityAuthorMeta({userId:1,nickname:"nova",level:7,completedTrainingCount:42});assert.equal(text,"Level 7 · 훈련 42회");assert.doesNotMatch(text,/@/)});
