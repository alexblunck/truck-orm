<?php

use Illuminate\Http\Request;
use App\Resume;
use App\ResumeSection;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('resume/all', function (Request $request) {
    return Resume::all();
});

Route::get('resume/{id}', function (Request $request) {
    return Resume::find($request->id);
});

Route::post('resume', function (Request $request) {
    return Resume::create($request->all());
});

Route::put('resume/{id}', function (Request $request) {
    $resume = Resume::find($request->id);
    $resume->update($request->all());

    return $resume;
});

Route::put('resume/{id}/sync', function (Request $request) {
    $resume = Resume::find($request->id);
    $resume[$request->key] = $request->value;

    return $resume;
});

Route::delete('resume/{id}', function (Request $request) {
    $resume = Resume::find($request->id);
    $resume->delete();

    return response(null, 200);
});

Route::post('resume/{id}/section', function (Request $request) {
    $resume = Resume::find($request->id);
    $section = $resume->sections()->create($request->all());

    return $section;
});

Route::put('resume/{resume_id}/section/{section_id}', function (Request $request) {
    $section = ResumeSection::find($request->section_id);
    $section->update($request->all());

    return $section;
});

Route::delete('resume/{resume_id}/section/{section_id}', function (Request $request) {
    $section = ResumeSection::find($request->section_id);
    $section->delete();

    return response(null, 200);
});
