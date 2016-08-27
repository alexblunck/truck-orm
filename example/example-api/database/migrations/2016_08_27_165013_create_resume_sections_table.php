<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResumeSectionsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('resume_sections', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->integer('resume_id')->unsigned();
            $table->foreign('resume_id')->references('id')->on('resume_sections');
            $table->string('name')->nullable();
            $table->string('type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::drop('resume_sections');
    }
}
